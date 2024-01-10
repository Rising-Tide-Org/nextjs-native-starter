import { firebaseAuth, firestore } from 'db'
import {
  DocumentReference,
  doc,
  setDoc,
  WithFieldValue,
  collection,
  CollectionReference,
  addDoc,
  UpdateData,
  updateDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore'
import { CollectionPath, TWithFieldValues } from 'types/Firebase'
import { Identifiable } from 'types/Generic'
import { getCollectionPath } from 'util/firebase'

/**
 * Create a record
 */
export const createRecord = async <T>(
  collectionPath: CollectionPath,
  data: TWithFieldValues<T>,
  id?: string
): Promise<DocumentReference<T> | null> => {
  try {
    const user = firebaseAuth.currentUser
    if (!user?.uid) {
      return null
    }
    const path = getCollectionPath(collectionPath, user.uid)

    if (id) {
      const docRef = doc(firestore, `${path}/${id}`) as DocumentReference<T>
      await setDoc(docRef, { id, ...data } as WithFieldValue<T>)
      return docRef
    } else {
      const collectionRef = collection(
        firestore,
        path
      ) as CollectionReference<T>
      const docRef = await addDoc(collectionRef, data as WithFieldValue<T>)
      return docRef
    }
  } catch (err) {
    console.error('Error creating document: ', err)
    throw err
  }
}

/**
 * Create a batch of records
 */
export const createRecordBatch = async <T>(
  collectionPath: CollectionPath,
  data: TWithFieldValues<T>[]
): Promise<void> => {
  try {
    const user = firebaseAuth.currentUser
    if (!user?.uid) {
      return
    }
    const path = getCollectionPath(collectionPath, user.uid)
    const collectionRef = collection(firestore, path) as CollectionReference<T>

    // start a new batch
    const batch = writeBatch(firestore)

    data.forEach((item) => {
      let docRef: DocumentReference<T> = doc(collectionRef)

      // if item has an id, use it
      const itemId = (item as Identifiable).id
      if (itemId) {
        docRef = doc(firestore, `${path}/${itemId}`) as DocumentReference<T>
      }
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const document = {
        ...item,
        id: docRef.id,
      } as WithFieldValue<T>
      batch.set(docRef, document)
    })

    // commit the batch
    await batch.commit()
  } catch (err) {
    console.error('Error creating batch documents: ', err)
    throw err
  }
}

/**
 * Update a record
 * @param collectionPath - path to collection
 * @param documentId - id of document
 * @param data - data to update, stricly typed to generic T
 * @param fieldPaths - field paths to update, e.g. { 'field.path': 'value' }
 */
export const updateRecord = async <T>(
  collectionPath: CollectionPath,
  documentId: string,
  data: UpdateData<WithFieldValue<T>>,
  fieldPaths: { [key: string]: any } = {}
): Promise<void> => {
  try {
    const user = firebaseAuth.currentUser
    if (!user?.uid) {
      return
    }
    const path = getCollectionPath(collectionPath, user.uid)
    const docRef = doc(
      firestore,
      `${path}/${documentId}`
    ) as DocumentReference<T>
    const updateData = {
      ...(data as Record<string, any>),
      ...fieldPaths,
    } as UpdateData<T>
    if (Object.keys(updateData as Record<string, any>).length === 0) {
      return Promise.resolve()
    }
    return await updateDoc(docRef, updateData)
  } catch (err) {
    console.error('Error updating document: ', err)
    // AK: bit dangerous to throw this caught error - noticed that most
    // implementations of `updateRecord` do not wrap it in a try/catch.
    throw err
  }
}

/**
 * Update a batch of records
 */

export const updateRecordBatch = async <T>(
  collectionPath: CollectionPath,
  updates: Array<{
    id: string
    data?: UpdateData<T>
    fieldPaths?: { [key: string]: any }
  }>
): Promise<void> => {
  try {
    const user = firebaseAuth.currentUser
    const path = getCollectionPath(collectionPath, user!.uid)

    const batch = writeBatch(firestore)

    updates.forEach(({ id, data, fieldPaths }) => {
      const docRef = doc(firestore, `${path}/${id}`)
      const updateData = {
        ...(data as Record<string, any>),
        ...fieldPaths,
      } as Record<string, any>
      batch.update(docRef, updateData)
    })

    await batch.commit()
  } catch (err) {
    console.error('Error updating documents: ', err)
    throw err
  }
}

/**
 * Delete a record
 * @param collectionPath
 * @param documentId
 */
export const deleteRecord = async (
  collectionPath: CollectionPath,
  documentId: string
): Promise<void> => {
  try {
    const user = firebaseAuth.currentUser
    const path = getCollectionPath(collectionPath, user!.uid)
    const docRef = doc(firestore, `${path}/${documentId}`)
    await deleteDoc(docRef)
  } catch (err) {
    console.error('Error deleting document: ', err)
    throw err
  }
}

/**
 * Delete records in batch
 * @param collectionPath
 * @param ids
 */
export const deleteRecordBatch = async (
  collectionPath: CollectionPath,
  ids: string[]
): Promise<void> => {
  const user = firebaseAuth.currentUser
  const path = getCollectionPath(collectionPath, user!.uid)

  const batch = writeBatch(firestore)

  for (const id of ids) {
    const docRef = doc(firestore, `${path}/${id}`)
    batch.delete(docRef)
  }

  await batch.commit()
}
