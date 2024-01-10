import { Pinecone } from '@pinecone-database/pinecone'
import { firestore } from 'firebase-admin'
import { deleteVectorsForUser, indexEntries } from 'lib/pinecone'
import { Entry } from 'types/Entry'
import { MigrationMetadata } from 'types/Migration'
import { User } from 'types/User'
import { RunnableMigration } from './RunnableMigration'

/**
 * The class name will be used to indicate this migration in firestore.
 * Use the following filename format to keep things organized: <migrationIndex>_<className>
 */
export class UpdateVectors extends RunnableMigration {
  className = 'UpdateVectors'

  async up(
    trx: firestore.Transaction,
    userRef: firestore.DocumentReference<firestore.DocumentData>
  ): Promise<MigrationMetadata | undefined> {
    const userSnapshot = await trx.get(userRef)
    const user = userSnapshot.data() as User
    if (!user.uuid) {
      throw Error('User uuid not found')
    }

    // Only run this migration for users who have memories indexed
    if (user.metadata?.backfilledVectors !== true) {
      return {
        vectorsIndexed: 0,
      }
    }

    // Delete existing vectors
    await deleteVectorsForUser(user.uuid)

    const entriesSnapshot = await trx.get(userRef.collection('entries'))
    const entries: Entry[] = entriesSnapshot.docs.map((doc) => ({
      ...(doc.data() as Entry),
      id: doc.id,
    }))

    // Re-index vectors using new chunking mechanism
    const client = new Pinecone()
    const vectorsIndexed = await indexEntries(client, user.uuid, entries)

    return {
      vectorsIndexed,
    }
  }
}
