import { firestore } from 'firebase-admin'
import { Timestamp } from 'firebase/firestore'
import moment from 'moment'
import { CollectionItemGoal } from 'types/Collection'
import { Goal } from 'types/Goal'
import { MigrationMetadata } from 'types/Migration'
import { RunnableMigration } from './RunnableMigration'

/**
 * The class name will be used to indicate this migration in firestore.
 * Use the following filename format to keep things organized: <migrationIndex>_<className>
 */
export class MigrateGoals extends RunnableMigration {
  className = 'MigrateGoals'

  async up(
    trx: firestore.Transaction,
    userRef: firestore.DocumentReference<firestore.DocumentData>
  ): Promise<MigrationMetadata | undefined> {
    const goalsSnapshot = await trx.get(userRef.collection('goals'))

    const goalItems: Record<string, CollectionItemGoal> = {}
    for (const doc of goalsSnapshot.docs) {
      const goal = doc.data() as Goal
      const itemRef = userRef.collection('items').doc(doc.id)
      const itemSnapshot = await itemRef.get()
      if (itemSnapshot.exists) {
        // So that we don't overwrite completions if the migration already occurred
        continue
      }

      const date = moment(goal.createdAt).toDate()
      const goalItem: CollectionItemGoal = {
        id: doc.id,
        type: 'goal',
        createdAt: firestore.Timestamp.fromDate(date) as Timestamp,
        title: goal.name,
        description: goal.description,
        metadata: {
          completions: goal.completions ?? [],
          completionsRequired: 0,
          interval: 'forever',
        },
        ...(goal.entryId && {
          references: {
            entries: [goal.entryId],
          },
        }),
      }
      goalItems[doc.id] = goalItem
    }

    // Perform writes after reads
    for (const [id, item] of Object.entries(goalItems)) {
      trx.set(userRef.collection('items').doc(id), item)
    }

    return {
      goalsMigrated: Object.keys(goalItems).length,
    }
  }
}
