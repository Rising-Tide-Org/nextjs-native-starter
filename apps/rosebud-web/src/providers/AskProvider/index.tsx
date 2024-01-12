import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react'
import useFetchMany from 'shared/hooks/useFetchMany'
import { query, serverTimestamp, where } from 'firebase/firestore'
import { AskItem } from 'types/Ask'
import { createRecord, createRecordBatch, updateRecord } from 'db/mutate'
import { useUserProvider } from 'providers/UserProvider'
import { fetchOne } from 'db/fetch'
import { kDefaultAsks } from 'lib/asks'

type AskProviderContextType = {
  asks: AskItem[] | undefined
  recentAsks: AskItem[] | undefined
  asksLoading: boolean
  createAsk: (content: string) => Promise<AskItem | null>
  updateLastAskedAt: (askId: string) => void
}

const defaultPromptContext = {} as AskProviderContextType

export const AskProviderContext =
  createContext<AskProviderContextType>(defaultPromptContext)

/**
 * React hook that reads from `PromptProvider` context
 * Returns modal disclosure control for generalized modals
 */
export const useAskProvider = () => {
  const context = useContext(AskProviderContext)
  if (context === undefined) {
    throw new Error('useAskProvider must be used within a PromptProvider')
  }
  return context
}

type Props = {
  parentId?: string
  children: ReactNode
}

export function AskProvider({ parentId, children }: Props) {
  const { user } = useUserProvider()

  const {
    data: asks,
    loading: asksLoading,
    error,
  } = useFetchMany<AskItem>(
    'items',
    (q) =>
      query(
        q,
        where('type', '==', 'ask'),
        where('parentId', '==', parentId ?? null)
      ),
    { subscribe: true }
  )

  useEffect(() => {
    // Populate suggested asks if user does not have asks yet
    if (asks && !asks.length && asksLoading === false && !error && !parentId) {
      createRecordBatch<AskItem>(
        'items',
        kDefaultAsks.map((ask) => ({
          ...ask,
          createdAt: serverTimestamp(),
        }))
      )
    }
  }, [asks, asksLoading, error, parentId])

  const recentAsks = useMemo(
    () =>
      asks
        ?.filter((ask) => ask.metadata?.lastAskedAt)
        .sort((a, b) => {
          return (
            (b.metadata?.lastAskedAt?.seconds ?? 0) -
            (a.metadata?.lastAskedAt?.seconds ?? 0)
          )
        }),
    [asks]
  )

  const createAsk = useCallback(
    async (content: string): Promise<AskItem | null> => {
      if (!content.length) {
        throw new Error('Question cannot be empty')
      }
      const record = await createRecord<AskItem>('items', {
        content,
        type: 'ask',
        createdAt: serverTimestamp(),
        createdBy: user.id,
        parentId: parentId ?? null,
      })
      if (!record?.id) {
        throw new Error('Error asking question')
      }
      return await fetchOne<AskItem>('items', record?.id)
    },
    [user.id, parentId]
  )

  const updateLastAskedAt = useCallback((askId: string) => {
    updateRecord<AskItem>('items', askId, {
      metadata: {
        lastAskedAt: serverTimestamp(),
      },
    })
  }, [])

  const context = useMemo(
    () => ({
      asks: asks ?? [],
      recentAsks,
      asksLoading,
      createAsk,
      updateLastAskedAt,
    }),
    [asks, recentAsks, asksLoading, createAsk, updateLastAskedAt]
  )

  return (
    <AskProviderContext.Provider value={context}>
      {children}
    </AskProviderContext.Provider>
  )
}
