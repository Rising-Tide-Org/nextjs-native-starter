import { firestore } from 'firebase-admin'
import { Entry } from 'types/Entry'
import { MigrationMetadata } from 'types/Migration'
import { RunnableMigration } from './RunnableMigration'

/**
 * The class name will be used to indicate this migration in firestore.
 * Use the following filename format to keep things organized: <migrationIndex>_<className>
 */
export class FixDuplicateTopics extends RunnableMigration {
  className = 'FixDuplicateTopics'

  async up(
    trx: firestore.Transaction,
    userRef: firestore.DocumentReference<firestore.DocumentData>
  ): Promise<MigrationMetadata | undefined> {
    // Get all entries and topics for the user
    const entriesSnapshot = await trx.get(userRef.collection('entries'))
    const topicsSnapshot = await trx.get(
      userRef.collection('items').where('type', '==', 'topic')
    )

    // Map of entryIds for each topicId
    const topicEntryMap: { [topicId: string]: string[] } = {}

    // Populate map with entryIds
    entriesSnapshot.forEach((entryDoc) => {
      const entry = entryDoc.data() as Entry
      if (entry.tagIndex) {
        entry.tagIndex.forEach((topicId: string) => {
          if (!topicEntryMap[topicId]) {
            topicEntryMap[topicId] = []
          }
          topicEntryMap[topicId].push(entryDoc.id)
        })
      }
    })

    // Update each topic with its corresponding references
    topicsSnapshot.forEach((topicDoc) => {
      const entryIds = topicEntryMap[topicDoc.id] || []
      const data = { 'references.entries': entryIds }
      trx.update(topicDoc.ref, data)
    })

    // Delete topics where the entryIds array is empty
    let topicsDeleted = 0
    topicsSnapshot.forEach((topicDoc) => {
      const entryIds = topicEntryMap[topicDoc.id] || []
      if (entryIds.length === 0) {
        trx.delete(topicDoc.ref)
        topicsDeleted++
      }
    })

    return {
      topicsUpdated: topicsSnapshot.size,
      topicsDeleted,
    }
  }
}
