import { firebaseAuth } from 'db'
import {
  createRecord,
  deleteRecord,
  deleteRecordBatch,
  updateRecord,
  updateRecordBatch,
} from 'db/mutate'
import { UpdateData } from 'firebase/firestore'
import { useCallback, useMemo, useState } from 'react'
import {
  CollectionPath,
  FirebaseMutation,
  TWithFieldValues,
} from 'types/Firebase'

/**
 * This hook creates, updates and deletes documents in Firestore.
 *
 * @param collectionPath The path to the collection in Firestore.
 * @param condition A function that takes a Firestore query and returns a query with any conditions applied.
 * @param options An object with options for the fetch.
 * @returns An object with the data, error and loading status.
 */

const useMutate = <T>(collectionPath: CollectionPath): FirebaseMutation<T> => {
  const user = firebaseAuth.currentUser
  const [error, setError] = useState<any>(null)

  const createRecordHook = useCallback(
    async (data: TWithFieldValues<T>, id?: string) => {
      if (!user) {
        setError('No user')
        return null
      }
      try {
        return await createRecord<T>(collectionPath, data, id)
      } catch (err) {
        setError(err)
        return null
      }
    },
    [collectionPath, user]
  )

  const updateRecordHook = useCallback(
    async (documentId: string, data: UpdateData<T>) => {
      if (!user) {
        setError('No user')
        return
      }
      try {
        await updateRecord<T>(collectionPath, documentId, data)
      } catch (err) {
        setError(err)
      }
    },
    [collectionPath, user]
  )

  const updateRecordBatchHook = useCallback(
    async (updates: Array<{ id: string; data: UpdateData<T> }>) => {
      if (!user) {
        setError('No user')
        return
      }
      try {
        await updateRecordBatch<T>(collectionPath, updates)
      } catch (err) {
        setError(err)
      }
    },
    [collectionPath, user]
  )

  const deleteRecordBatchHook = useCallback(
    async (documentIds: string[]) => {
      if (!user) {
        setError('No user')
        return
      }
      try {
        await deleteRecordBatch(collectionPath, documentIds)
      } catch (err) {
        setError(err)
      }
    },
    [collectionPath, user]
  )

  const deleteRecordHook = useCallback(
    async (id: string) => {
      if (!user) {
        setError('No user')
        return
      }
      try {
        await deleteRecord(collectionPath, id)
      } catch (err) {
        setError(err)
      }
    },
    [collectionPath, user]
  )

  const result = useMemo(
    () => ({
      createRecord: createRecordHook,
      updateRecord: updateRecordHook,
      deleteRecord: deleteRecordHook,
      updateRecordBatch: updateRecordBatchHook,
      deleteRecordBatch: deleteRecordBatchHook,
      error,
    }),
    [
      createRecordHook,
      updateRecordHook,
      deleteRecordHook,
      updateRecordBatchHook,
      deleteRecordBatchHook,
      error,
    ]
  )

  return result
}

export default useMutate
