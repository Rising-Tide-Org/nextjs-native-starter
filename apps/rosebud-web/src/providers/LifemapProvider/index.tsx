import React, { createContext, ReactNode, useContext, useMemo } from 'react'
import useFetchMany from 'shared/hooks/useFetchMany'
import { query, where } from 'firebase/firestore'
import { CollectionItemTopic } from 'types/Collection'
import { useEntryProvider } from 'providers/EntryProvider'

type LifemapProviderContextType = {
  topics: CollectionItemTopic[]
  reviewTopics: CollectionItemTopic[]
  viewedTopics: CollectionItemTopic[]
  isAvailable?: boolean
}

const defaultProviderContext = {
  topics: [],
  reviewTopics: [],
  viewedTopics: [],
  isAvailable: false,
} as LifemapProviderContextType

export const LifemapProviderContext = createContext<LifemapProviderContextType>(
  defaultProviderContext
)

/**
 * React hook that reads from a context
 * Returns modal disclosure control for generalized modals
 */
export const useLifemapProvider = () => {
  const context = useContext(LifemapProviderContext)
  if (context === undefined) {
    throw new Error('useLifemapProvider must be used within a context')
  }
  return context
}

type Props = {
  children: ReactNode
}

export function LifemapProvider({ children }: Props) {
  const { data: topics } = useFetchMany<CollectionItemTopic>(
    'items',
    (q) => query(q, where('type', '==', 'topic')),
    {
      subscribe: true,
    }
  )
  const { entries } = useEntryProvider()

  const reviewTopics = useMemo(() => {
    return topics?.filter(
      (t) =>
        t.metadata.type !== 'emotion' &&
        (t.createdAt?.seconds ?? 0) < 1704067200 &&
        (t.metadata.mentions ?? 0) > 1
    )
  }, [topics])

  const viewedTopics = useMemo(
    () => topics?.filter((topic) => topic.metadata.lastPageGeneration),
    [topics]
  )

  const isAvailable = useMemo(
    () => entries.length >= 3 && reviewTopics?.length,
    [entries.length, reviewTopics]
  )

  const context = useMemo(
    () => ({
      topics: topics ?? [],
      reviewTopics: reviewTopics ?? [],
      viewedTopics: viewedTopics ?? [],
      isAvailable: Boolean(isAvailable),
    }),
    [topics, reviewTopics, viewedTopics, isAvailable]
  )

  return (
    <LifemapProviderContext.Provider value={context}>
      {children}
    </LifemapProviderContext.Provider>
  )
}
