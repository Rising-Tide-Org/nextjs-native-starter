import { DocumentData } from 'firebase/firestore'
import { CollectionPath, QueryAdminCondition } from 'types/Firebase'
import { getCollectionPath } from 'util/firebase'

type CollectionGroupType =
  FirebaseFirestore.CollectionGroup<FirebaseFirestore.DocumentData>
type QueryType = FirebaseFirestore.Query<FirebaseFirestore.DocumentData>

const defaultConditionalCallback = async (q: CollectionGroupType) => q

export const fetchGroup = async <T>(
  db: FirebaseFirestore.Firestore,
  groupPath: CollectionPath,
  conditionCallback: (
    query: CollectionGroupType
  ) =>
    | Promise<CollectionGroupType>
    | Promise<QueryType> = defaultConditionalCallback
): Promise<{
  data: T[]
  docs: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[]
  ref: CollectionGroupType | QueryType | null
}> => {
  const groupRef = await conditionCallback(db.collectionGroup(groupPath))
  const groupSnapshot = await groupRef.get()

  return {
    ref: groupRef,
    data: groupSnapshot.empty
      ? []
      : groupSnapshot.docs.map((doc) => doc.data() as T),
    docs: groupSnapshot.docs,
  }
}

/**
 * Fetch many documents from a collection in Firestore.
 */
export const fetchMany = async <T>(
  db: FirebaseFirestore.Firestore,
  collectionPath: CollectionPath,
  query: QueryAdminCondition,
  userId?: string
): Promise<{
  data: T[]
  docs: FirebaseFirestore.QueryDocumentSnapshot<DocumentData>[]
}> => {
  const path = getCollectionPath(collectionPath, userId)
  const collectionRef = query(db.collection(path))
  const querySnapshot = await collectionRef.get()

  if (!querySnapshot.empty) {
    const documentsData = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as T[]
    return { data: documentsData, docs: querySnapshot.docs }
  } else {
    return { data: [], docs: [] }
  }
}

/**
 * Fetch a single document from a collection in Firestore.
 */
export const fetchOne = async <T>(
  db: FirebaseFirestore.Firestore,
  collectionPath: CollectionPath,
  documentId: string,
  userId?: string
): Promise<{
  data: T | null
  doc: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData> | null
  ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> | null
}> => {
  const path = getCollectionPath(collectionPath, userId) + '/' + documentId
  const documentRef = await db.doc(path)
  const docSnapshot = await documentRef.get()

  if (docSnapshot.exists) {
    const documentData = docSnapshot.data() as T
    return { data: documentData, doc: docSnapshot, ref: documentRef }
  } else {
    return { data: null, doc: null, ref: null }
  }
}
