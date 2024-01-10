import { firestore } from 'firebase-admin'
import { MigrationMetadata } from 'types/Migration'

export abstract class RunnableMigration {
  abstract className: string
  abstract up(
    trx: firestore.Transaction,
    userRef: firestore.DocumentReference<firestore.DocumentData>
  ): Promise<MigrationMetadata | undefined>
}
