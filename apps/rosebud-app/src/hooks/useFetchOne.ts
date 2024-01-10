import { firebaseAuth } from 'db'
import { fetchOneSubscription, fetchOne } from 'db/fetch'
import { useState, useEffect, useMemo } from 'react'
import {
  CollectionPath,
  FetchOptions,
  FirebaseResponseOne,
} from 'types/Firebase'

/**
 * This hook fetches a single document from a collection in Firestore.
 *
 * @param collectionPath The path to the collection in Firestore.
 * @param documentId The ID of the document to fetch.
 * @param options An object with options for the fetch.
 * @returns An object with the data, error and loading status.
 */

const useFetchOne = <T>(
  collectionPath: CollectionPath,
  documentId?: string,
  options: FetchOptions = {}
): FirebaseResponseOne<T> => {
  const user = firebaseAuth.currentUser

  // State to store the data, loading and error status
  const [data, setData] = useState<T | null>()
  const [loading, setLoading] = useState(Boolean(user))
  const [error, setError] = useState<any>()

  useEffect(() => {
    if (!user) {
      setError(new Error('No authenticated user'))
      return
    }

    if (options.skip) {
      return
    }

    setLoading(true)

    if (options.subscribe) {
      // Listen to real-time updates
      const unsubscribe = fetchOneSubscription<T>(
        collectionPath,
        documentId!,
        (data) => {
          setData(data)
          setLoading(false)
        },
        (error) => {
          setError(error)
          setLoading(false)
        }
      )

      return () => unsubscribe() // Clean up the listener on unmount
    } else {
      // Perform a one-time fetch
      fetchOne<T>(collectionPath, documentId!, { noCache: options.noCache })
        .then((data) => {
          setData(data)
          setLoading(false)
        })
        .catch((err) => {
          console.error('Error fetching data: ', err)
          setError(err)
          setLoading(false)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, documentId, options.skip])

  const result = useMemo(
    () => ({
      data,
      error,
      loading,
    }),
    [data, error, loading]
  )

  return result
}

export default useFetchOne
