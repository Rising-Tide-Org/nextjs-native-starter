import admin from 'firebase-admin'
import dotenv from 'dotenv'
import { User } from 'types/User'

dotenv.config()

export const firebaseConfig = {
  client: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  },
  server: {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
  },
}

// To support \n in the private key, we need to replace it with a real newline
function formatFirebasePrivateKey(key: string) {
  return key.replace(/\\n/g, '\n')
}

export async function initializeAdmin() {
  const config = firebaseConfig.server
  const privateKey = formatFirebasePrivateKey(config.privateKey as string)

  // if already created, return the same instance
  if (admin.apps.length > 0) {
    return admin.app()
  }

  // create certificate
  const cert = admin.credential.cert({
    projectId: config.projectId,
    clientEmail: config.clientEmail,
    privateKey,
  })

  // initialize admin app
  return admin.initializeApp({
    credential: cert,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
  })
}

async function migrate() {
  const db = (await initializeAdmin()).firestore()

  // Start a new batch
  const batch = db.batch()

  await repairUsers(db, batch)

  // console.info(batch)

  // Commit the batch
  await batch.commit()
}

/**
 * This function will repair users that do not have an SMS device on OneSignal,
 * but they have a verified phone number and a reminder hour in Firestore.
 */

async function repairUsers(
  db: admin.firestore.Firestore,
  batch: admin.firestore.WriteBatch
) {
  const query = db
    .collection('users')
    .where('phoneVerified', '==', true)
    .orderBy('createdAt', 'desc')
  const snapshot = await query.get()

  let count = 0

  for (const doc of snapshot.docs) {
    const user = doc.data() as User

    if (
      user.phone &&
      user.phoneVerified &&
      !user.onesignal_id &&
      user.reminder_hour_utc
    ) {
      // Create the device on one signal
      const response = await fetch('https://onesignal.com/api/v1/players', {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          app_id: process.env.ONE_SIGNAL_APP_ID,
          device_type: 14,
          identifier: user.phone,
          external_user_id: user.uuid,
          tags: {
            reminder_at_utc_hour: user.reminder_hour_utc,
            timezone: user.timezone,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      } else {
        // Parse the response body as JSON
        const data = await response.json()

        count++

        const userWithUTCHour = {
          onesignal_id: data.id,
        }

        console.info('OneSignal user updated:', {
          uuid: user.uuid,
          reminder_hour_utc: user.reminder_hour_utc,
          phone: user.phone,
          ...userWithUTCHour,
        })

        batch.update(doc.ref, userWithUTCHour)
      }
    }
  }

  console.info(count, 'users repaired')
}

migrate().catch(console.error)
