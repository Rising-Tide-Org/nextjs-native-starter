import { captureException as sentryCaptureException } from '@sentry/nextjs'
import { NextApiResponse } from 'next'
import withMiddleware from 'middleware'
import { NextAuthApiRequest } from 'middleware/tokenVerification'
import { initializeAdmin } from 'db-server'
import { fetchOne } from 'db-server/fetch'
import { User } from 'types/User'
import { kMigrations } from 'migrations'
import { getCollectionPath } from 'util/firebase'
import { Migration } from 'types/Migration'
import { firestore } from 'firebase-admin'

const handler = async (req: NextAuthApiRequest, res: NextApiResponse) => {
  try {
    const userId = req._user?.id

    if (!userId) {
      return res.status(404).json({ error: { message: 'User not found' } })
    }

    const app = await initializeAdmin()
    const db = await app.firestore()
    const snapshot = await fetchOne<User>(db, 'users', userId)
    const userRef = snapshot.ref
    const user = snapshot.data

    if (!userRef || !user) {
      return res.status(404).json({ error: { message: 'User not found' } })
    }

    const latestMigrationNumber = kMigrations.length
    const userMigrationNumber = user.migrationNumber ?? 0

    if (userMigrationNumber >= latestMigrationNumber) {
      return res.status(201).json({})
    }

    try {
      for (const [index, RunnableMigration] of kMigrations.entries()) {
        const migrationNumber = index + 1
        // Skip migrations that have already been applied
        if (migrationNumber <= userMigrationNumber) continue
        const migration = new RunnableMigration()
        const migrationName = `${migrationNumber}_${migration.className}`

        // Run in transaction
        await db.runTransaction(async (trx) => {
          // Run migration
          const metadata = await migration.up(trx, userRef)

          // Update user document to keep record of migration
          trx.update(userRef, {
            migrationNumber,
          })
          const path = getCollectionPath('migrations', userId)
          const docRef = await db.doc(path + '/' + migrationName)
          const docData: Migration = {
            id: migrationName,
            number: migrationNumber,
            appliedAt: firestore.FieldValue.serverTimestamp(),
            metadata,
          }
          trx.create(docRef, docData)
        })
        console.log(`Applied migration: ${migrationName}`)
      }
    } catch (error) {
      console.error('Error applying migrations:', error)
      throw error
    }

    return res.status(200).json({})
  } catch (error) {
    res.status(500).json({ error: { message: 'Internal error' } })
    sentryCaptureException(new Error(`Error applying migration: ${error}`))
  }
}

export default withMiddleware({
  methods: ['GET'],
  authenticated: true,
})(handler)
