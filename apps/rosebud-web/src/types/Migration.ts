import { FieldValue, Timestamp } from 'firebase/firestore'

export type MigrationMetadata = Record<string, string | number | boolean>

export type Migration = {
  id: string
  number: number
  appliedAt: Timestamp | FieldValue
  metadata?: MigrationMetadata
}
