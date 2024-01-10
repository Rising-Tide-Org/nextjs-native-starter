import { WithFieldValue } from 'firebase/firestore'
import { CollectionPath } from 'types/Firebase'
import { getCollectionPath } from 'util/firebase'

/**
 * Update a record in Firestore
 * @param collectionPath - path to collection
 * @param options - map of options
 * @param userId - id of requesting user
 * @param documentId - id of document
 * @param data - data to update
 * @param fieldPaths - field paths to update, e.g. { 'field.path': 'value' }
 */
export const updateRecord = async <T>(
  db: FirebaseFirestore.Firestore,
  collectionPath: CollectionPath,
  documentId: string,
  options: {
    userId: string
    data?: WithFieldValue<Partial<T>>
    fieldPaths?: { [key: string]: WithFieldValue<any> }
  }
): Promise<void> => {
  const { userId, data, fieldPaths } = options
  try {
    if (!data && !fieldPaths) {
      throw new Error('No data or field paths provided')
    }
    const path = getCollectionPath(collectionPath, userId)
    const docRef = await db.doc(path + '/' + documentId)

    const updateData = {
      ...((data as Record<string, any>) || {}),
      ...fieldPaths,
    }

    if (Object.keys(updateData as Record<string, any>).length > 0) {
      await docRef.update(updateData)
    }

    Promise.resolve()
  } catch (err) {
    console.error('Error updating document: ', err)
    throw err
  }
}
