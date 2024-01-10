import { firebaseAuth, firestore } from 'db'
import type { Unsubscribe } from 'firebase/auth'
import {
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  getDocsFromServer,
  onSnapshot,
  query,
} from 'firebase/firestore'
import Analytics from 'lib/analytics'
import { CollectionPath, QueryCondition } from 'types/Firebase'
import { getCollectionPath } from 'util/firebase'

/**
 * Fetch a single document from a collection in Firestore.
 * @param collectionPath
 * @param documentId
 * @returns
 */
export const fetchOne = async <T>(
  collectionPath: CollectionPath,
  documentId: string,
  options?: {
    noCache?: boolean
  }
): Promise<T | null> => {
  const user = firebaseAuth.currentUser

  if (!user) {
    throw new Error('No authenticated user')
  }

  const path = getCollectionPath(collectionPath, user.uid) + '/' + documentId
  const documentRef = doc(firestore, path)
  const docSnapshot = await (options?.noCache ? getDocFromServer : getDoc)(
    documentRef
  )

  if (docSnapshot.exists()) {
    const documentData = docSnapshot.data()
    return { ...documentData, id: docSnapshot.id } as T
  } else {
    return null
  }
}

/**
 * Fetch a single document from a collection in Firestore and subscribe to real-time updates.
 */
export const fetchOneSubscription = <T>(
  collectionPath: CollectionPath,
  documentId: string,
  onDataChange: (data: T | null) => void,
  onError: (error: Error) => void
): Unsubscribe => {
  const user = firebaseAuth.currentUser

  if (!user) {
    onError(new Error('No authenticated user'))
    return () => {}
  }

  const path = getCollectionPath(collectionPath, user.uid) + '/' + documentId
  const documentRef = doc(firestore, path)

  try {
    const unsubscribe = onSnapshot(
      documentRef,
      (doc) => {
        if (doc.exists()) {
          const docData = doc.data()
          onDataChange({ ...docData, id: doc.id } as T)
        } else {
          // attempt to debug a critical auth issue where user doc seems to be missing
          if (collectionPath === 'users') {
            Analytics.trackEvent('auth.user.missing', {
              authUserId: user.uid,
              authUserEmail: user.email,
              authUserIsAnon: user.isAnonymous,
              docRefId: documentRef.id,
              docRefPath: documentRef.path,
              docRefType: documentRef.type,
            })
          }

          onDataChange(null)
        }
      },
      onError
    )

    return unsubscribe
  } catch (error) {
    onError(error)
    return () => {}
  }
}

export const fetchMany = async <T>(
  collectionPath: CollectionPath,
  condition: QueryCondition = (q) => q,
  options?: {
    noCache?: boolean
  }
): Promise<T[]> => {
  const user = firebaseAuth.currentUser

  if (!user) {
    throw new Error('No user')
  }

  const path = getCollectionPath(collectionPath, user.uid)
  const collectionRef = collection(firestore, path)
  const queryWithCondition = condition(query(collectionRef))

  const snapshot = await (options?.noCache ? getDocsFromServer : getDocs)(
    queryWithCondition
  )
  const fetchedData = snapshot.docs.map(
    (doc) => ({ ...doc.data(), id: doc.id } as T)
  )

  return fetchedData
}

// Function to create a real-time subscription to many documents from Firestore
export const fetchManySubscription = <T>(
  collectionPath: CollectionPath,
  condition: QueryCondition,
  onDataChange: (data: T[]) => void,
  onError: (error: Error) => void
): Unsubscribe => {
  const user = firebaseAuth.currentUser

  if (!user) {
    // Return a "dummy" function that does nothing
    return () => {}
  }

  const path = getCollectionPath(collectionPath, user.uid)
  const collectionRef = collection(firestore, path)
  const queryWithCondition = condition(query(collectionRef))

  const unsubscribe = onSnapshot(
    queryWithCondition,
    (snapshot) => {
      const fetchedData = snapshot.docs.map(
        (doc) => ({ ...doc.data(), id: doc.id } as T)
      )
      onDataChange(fetchedData)
    },
    onError
  )

  return unsubscribe
}
