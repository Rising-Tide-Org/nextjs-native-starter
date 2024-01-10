import { fetchOne } from 'db/fetch'
import { deleteRecord, updateRecordBatch } from 'db/mutate'
import {
  documentId,
  increment,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import useFetchMany from 'hooks/useFetchMany'
import { Template } from 'lib/template'
import moment from 'moment'
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react'
import { CollectionItemTopic } from 'types/Collection'
import { Entry } from 'types/Entry'
import { getFuzzyWeek, isFuzzyToday } from 'util/date'
import { updateEntryStats } from 'util/stats'

type EntryProviderContextType = {
  entries: Entry[]
  dailyEntryCreated: boolean
  newYears2024JournalCompleted: boolean
  weeklySummaryAvailable?: string // e.g. 2023-28
  noEntries: boolean
  entriesLoading: boolean
  deleteEntry: (entryId: string) => void
}

const defaultEntryContext = {
  entries: [],
  dailyEntryCreated: false,
  newYears2024JournalCompleted: false,
  noEntries: null,
  entriesLoading: null,
} as unknown as EntryProviderContextType

export const EntryProviderContext =
  createContext<EntryProviderContextType>(defaultEntryContext)

/**
 * React hook that reads from `EntryProvider` context
 * Returns access to recent entries and weekly summaries
 */
export const useEntryProvider = () => {
  const context = useContext(EntryProviderContext)
  if (context === undefined) {
    throw new Error('useEntryProvider must be used within a EntryProvider')
  }
  return context
}

type Props = {
  children: ReactNode
}

const kEntryLimit = 10

export function EntryProvider({ children }: Props) {
  const { loading: entriesLoading, data: entries } = useFetchMany<Entry>(
    'entries',
    (q) => query(q, limit(kEntryLimit), orderBy('day', 'desc')),
    {
      subscribe: true,
    }
  )

  const { data: summaries } = useFetchMany<Entry>(
    'analysis',
    (q) =>
      query(
        q,
        where('type', '==', 'weekly'),
        orderBy(documentId(), 'desc'),
        limit(1)
      ),
    {
      subscribe: true,
    }
  )

  const noEntries = useMemo(() => Boolean(entries?.length === 0), [entries])

  /**
   * Check if the user has created a daily entry today
   * Returns true if they created a daily entry for
   * the current time frame (e.g. morning intention, daily reflection)
   */
  const dailyEntryCreated = useMemo(() => {
    const templateId = Template.getTemplateForCheckIn().id
    return Boolean(
      entries?.find(
        (entry) =>
          entry.templateId === templateId &&
          entry.day &&
          isFuzzyToday(entry.day)
      )
    )
  }, [entries])

  const newYears2024JournalCompleted = useMemo(
    () =>
      Boolean(entries?.find((entry) => entry.templateId === 'new-year-2024')),
    [entries]
  )

  /**
   * Check if the user has enough entries to generate a weekly summary
   * and if they haven't already generated one.
   * @returns Returns the week ID (e.g. 2023-39) if a summary can be generated
   */
  const weeklySummaryAvailable = useMemo(() => {
    const currentWeek = getFuzzyWeek()
    const summaryAlreadyGenerated = Boolean(
      summaries?.find((summary) => summary.id === `weekly-${currentWeek}`)
    )

    // Calculate the number of entries created this week
    const entriesThisWeek =
      entries?.filter((entry) =>
        moment(entry.day).isSame(moment(currentWeek, 'GGGG-WW'), 'week')
      ).length ?? 0

    // If there are more than 3 entries, we can generate a summary
    return entriesThisWeek >= 3 && !summaryAlreadyGenerated
      ? currentWeek
      : undefined
  }, [entries, summaries])

  /**
   * Delete an entry
   */
  const handleDeleteEntry = useCallback(async (entryId: string) => {
    const entry = await fetchOne<Entry>('entries', entryId)
    if (!entry) return

    // Delete the entry
    const deleteEntry = deleteRecord('entries', entryId)

    // Decrement the tag counts
    const updateMentions = updateRecordBatch<CollectionItemTopic>(
      'items',
      entry.tagIndex?.map((tagId) => ({
        id: tagId,
        fieldPaths: {
          'metadata.mentions': increment(-1),
        },
      })) ?? []
    )

    // Update stats
    updateEntryStats(entry, true)

    await Promise.all([deleteEntry, updateMentions])
  }, [])

  const context = useMemo(
    () => ({
      entries: entries ?? [],
      dailyEntryCreated,
      newYears2024JournalCompleted,
      weeklySummaryAvailable,
      noEntries,
      entriesLoading,
      deleteEntry: handleDeleteEntry,
    }),
    [
      entries,
      dailyEntryCreated,
      newYears2024JournalCompleted,
      weeklySummaryAvailable,
      noEntries,
      entriesLoading,
      handleDeleteEntry,
    ]
  )

  return (
    <EntryProviderContext.Provider value={context}>
      {children}
    </EntryProviderContext.Provider>
  )
}
