import { kCollectionPathMap } from 'constants/firebase'
import {
  DocumentData,
  DocumentReference,
  Query,
  UpdateData,
  WithFieldValue,
} from 'firebase/firestore'

/**
 * Return type for a fetch response with many documents.
 */
export type FirebaseResponseMany<T> = {
  data: T[] | null | undefined
  error: any
  loading: boolean
}

/**
 * Return type for a fetch response with one document.
 */
export type FirebaseResponseOne<T> = {
  data: T | null | undefined
  error: any
  loading: boolean
}

/**
 * Return type for a mutation response.
 */
export type FirebaseMutation<T> = {
  createRecord: (
    data: TWithFieldValues<T>,
    id?: string // Optionally create a record with a custom ID
  ) => Promise<DocumentReference<T> | null>
  updateRecord: (documentId: string, data: UpdateData<T>) => Promise<void>
  deleteRecord: (id: string) => Promise<void>
  updateRecordBatch: (
    updates: Array<{ id: string; data: UpdateData<T> }>
  ) => Promise<void>
  deleteRecordBatch: (ids: string[]) => Promise<void>
  error: any
}

/**
 * Wrapper to make types compatible with Firestore's WithFieldValue type.
 */
export type TWithFieldValues<T> = {
  [K in keyof T]: T[K] | WithFieldValue<DocumentData>
}

/**
 * A function that takes a Firestore query and returns a query with any conditions applied.
 */
export type QueryCondition = (q: Query) => Query

/**
 * A function that takes a Firestore query for the Admin SDK and returns a query with any conditions applied.
 */
export type QueryAdminCondition = (
  q: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>
) => FirebaseFirestore.Query<FirebaseFirestore.DocumentData>

/**
 * Options for the fetches
 */
export type FetchOptions = {
  subscribe?: boolean
  skip?: boolean
  noCache?: boolean
}

/**
 * Collection paths in Firestore
 */
export type CollectionPath = keyof typeof kCollectionPathMap
