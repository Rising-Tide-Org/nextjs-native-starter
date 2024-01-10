import { Timestamp } from 'firebase/firestore'
import { Identifiable } from './Generic'

export type Analysis = Identifiable & {
  type?: 'weekly'
  entryIds?: string[]
  title?: string
  summary?: string
  createdAt: Timestamp
  [key: string]: any
}
