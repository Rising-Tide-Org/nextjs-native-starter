import { Timestamp } from 'firebase/firestore'
import { CollectionItem } from './Collection'

export type AskDisplayMode = 'lite' | 'full'

export type AskItemMetadata = {
  lastAskedAt?: Timestamp
}

export type AskItem = CollectionItem & {
  parentId: string | null
  metadata?: AskItemMetadata
}
