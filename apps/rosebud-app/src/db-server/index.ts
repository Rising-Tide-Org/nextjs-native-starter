import admin from 'firebase-admin'
import { firebaseConfig } from 'constants/firebase'

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
  const app = admin.initializeApp({
    credential: cert,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
  })

  // ignores undefined properties
  // This fixes the "cannot use undefined as a Firestore value" error
  app.firestore().settings({ ignoreUndefinedProperties: true })

  return app
}
