import { useEffect, useState } from 'react'
import {
  QueryCondition,
  FirebaseResponseMany,
  FetchOptions,
  CollectionPath,
} from 'types/Firebase'
import { fetchMany, fetchManySubscription } from 'db/fetch'
import { collection, query, Query, queryEqual } from 'firebase/firestore'
import { firebaseAuth, firestore } from 'db'
import { getCollectionPath } from 'util/firebase'

/**
 * This hook fetches many documents from a collection in Firestore.
 *
 * @param collectionPath The path to the collection in Firestore.
 * @param condition A function that takes a Firestore query and returns a query with any conditions applied.
 * @param options An object with options for the fetch.
 * @returns An object with the data, error and loading status.
 */

const useFetchMany = <T>(
  collectionPath: CollectionPath,
  condition: QueryCondition = (q) => q,
  options: FetchOptions = {}
): FirebaseResponseMany<T> => {
  // State to store the data, loading and error status
  const [data, setData] = useState<T[] | null>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>()
  const [currentQuery, setCurrentQuery] = useState<Query>()

  const user = firebaseAuth.currentUser

  useEffect(() => {
    if (!user) {
      setError(new Error('No authenticated user'))
      return
    }

    if (!currentQuery || options.skip) {
      return
    }

    setLoading(true)

    const onSuccess = (fetchedData: T[]) => {
      setData(fetchedData)
      setLoading(false)
    }

    const onError = (err: any) => {
      console.error(`[${collectionPath}] Error fetching data: `, err)
      setError(err)
      setLoading(false)
    }

    if (options.subscribe) {
      // Listen to real-time updates
      const unsubscribe = fetchManySubscription<T>(
        collectionPath,
        (_) => currentQuery, // TODO: Figure out a better way to do this
        onSuccess,
        onError
      )
      return () => unsubscribe() // Clean up the listener on unmount
    } else {
      // Perform a one-time fetch
      fetchMany<T>(collectionPath, condition).then(onSuccess).catch(onError)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentQuery])

  /**
   * This effect runs whenever the condition function changes.
   * It updates the stored query if the new query is different from the old one.
   */
  useEffect(() => {
    if (!user) {
      return
    }

    const path = getCollectionPath(collectionPath, user.uid)
    const collectionRef = collection(firestore, path)
    const newQuery = condition(query(collectionRef))

    if (!currentQuery) {
      setCurrentQuery(newQuery)
      return
    }
    // Check for equality
    if (queryEqual(newQuery, currentQuery)) {
      return
    }

    setCurrentQuery(newQuery)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [condition])

  if (!user) {
    return {
      data: undefined,
      error: 'You must be logged in to use this hook',
      loading: false,
    }
  }

  return {
    data,
    error,
    loading,
  }
}

export default useFetchMany
