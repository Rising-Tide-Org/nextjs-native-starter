import { kMinWordsForReflection } from 'constants/defaults'
import { kGenericErrorMessage } from 'constants/error'
import { kPromptGenerationsPerDay } from 'constants/limits'
import { getModelByContext, kGPTModelMap } from 'constants/models'
import { fetchMany } from 'db/fetch'
import {
  createRecord,
  createRecordBatch,
  deleteRecord,
  updateRecord,
  updateRecordBatch,
} from 'db/mutate'
import {
  arrayRemove,
  arrayUnion,
  increment,
  query,
  serverTimestamp,
  Timestamp,
  where,
} from 'firebase/firestore'
import Analytics, { AnalyticsProps } from 'lib/analytics'
import navigator from 'lib/routes'
import { isArray } from 'lodash'
import moment from 'moment'
import { StreamReturnType } from 'net/api'
import {
  entryReflection,
  extractEntities,
  generateContent,
  suggestCommitmentsStream,
} from 'net/openai'
import { useRouter } from 'next/router'
import { useEntryProvider } from 'providers/EntryProvider'
import { useGoalsProvider } from 'providers/GoalsProvider'
import { usePromptProvider } from 'providers/PromptProvider'
import { useStreakProvider } from 'providers/StreakProvider'
import { useSubscriptionProvider } from 'providers/SubscriptionProvider'
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  CollectionItem,
  CollectionItemGoal,
  CollectionItemGoalInterval,
  CollectionItemTopic,
  CollectionItemType,
} from 'types/Collection'
import { Entities, Entry } from 'types/Entry'
import AlertDialog from 'ui/core/AlertDialog'
import { getRandomElement } from 'util/array'
import { convertEntitiesToTags } from 'util/entities'
import { entryWordCount, isPromptUsedByDraftEntries } from 'util/entries'
import PartialJSONParser from 'util/json'

type SummaryProviderContextType = {
  entry: Entry
  reflection?: string
  reflectionTitle?: string
  reflectionDone: boolean
  reflectionError: boolean
  entities?: CollectionItemTopic[]
  suggestions?: CollectionItemGoal[]
  isEntryTooShort: boolean
  streakReward?: CollectionItem
  rewardError?: boolean
  isStreak: boolean // Whether or not this entry is responsible for continuing the streak

  fetchStreakReward: (type?: CollectionItemType) => void
  fetchSuggestions: (regenerate?: boolean) => void
  retryReflection: () => void
  addGoal: (
    title: string,
    description: string,
    interval: CollectionItemGoalInterval,
    rate: number
  ) => Promise<string | undefined>
  removeGoal: (goalId: string, name: string) => void
  exitSummary: () => void

  suggestionsStreaming: boolean
  rewardStreaming: boolean
}

const defaultGoalsContext = {}

export const SummaryProviderContext = createContext<SummaryProviderContextType>(
  defaultGoalsContext as unknown as SummaryProviderContextType
)

/**
 * React hook that reads from `SummaryProvider` context
 * Returns modal disclosure control for generalized modals
 */
export const useSummaryProvider = () => {
  const context = useContext(SummaryProviderContext)
  if (context === undefined) {
    throw new Error('useSummaryProvider must be used within a SummaryProvider')
  }
  return context
}

type Props = {
  children: ReactNode
  entry: Entry
  returnTo?: string
}

export function SummaryProvider({ children, entry, returnTo }: Props) {
  const router = useRouter()

  // Providers
  const { addGoal, deleteGoal } = useGoalsProvider()
  const { streak } = useStreakProvider()
  const { isSubscriptionActive, openSubscribeModal } = useSubscriptionProvider()
  const { generatePersonalPrompts } = usePromptProvider()
  const { entries } = useEntryProvider()

  // State
  const [entities, setEntities] = useState<CollectionItemTopic[]>()
  const [reflectionTitle, setReflectionTitle] = useState<string>('')
  const [reflection, setReflection] = useState<string>()
  const [reflectionDone, setReflectionDone] = useState(false)
  const [reflectionError, setReflectionError] = useState<boolean>(false)
  const [isEntryTooShort, setIsEntryTooShort] = useState<boolean>(false)
  const [suggestions, setSuggestions] = useState<CollectionItemGoal[]>()
  const [streakReward, setStreakReward] = useState<CollectionItem>()
  const [rewardError, setRewardError] = useState<boolean>(false)
  const [suggestionsStreaming, setSuggestionsStreaming] = useState(false)
  const [rewardStreaming, setRewardStreaming] = useState(false)
  const [isStreak, setIsStreak] = useState(false)
  const [error, setError] = useState<string>()
  const initializedRef = useRef(false)

  // Stream refs
  const suggestionsStreamRef = useRef<StreamReturnType>()
  const reflectionStreamRef = useRef<StreamReturnType>()
  const rewardStreamRef = useRef<StreamReturnType>()

  useEffect(() => {
    if (!entry || initializedRef.current) {
      return
    }

    initializedRef.current = true // Prevent re-initialization

    if (!entry.summary?.content) {
      processEntry()
    } else {
      setReflectionTitle(entry.summary.title)
      setReflection(entry.summary.content)
      setEntities(entry.tags)
      setReflectionDone(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry])

  useEffect(() => {
    // Check whether this entry is responsible for continuing the streak
    if (streak?.lastItemId === entry.id) {
      setIsStreak(true)
    }
  }, [entry, streak])

  /**
   * Fetch suggestions from OpenAI
   */
  const fetchSuggestions = useCallback(
    (regenerate = false) => {
      // If suggestions are already loaded, don't regenerate
      // Unless regenerate is true
      if (suggestions && !regenerate) {
        return
      }

      if (regenerate && !isSubscriptionActive) {
        openSubscribeModal('regenerateSuggestions')
        return
      }

      setSuggestionsStreaming(true)
      setSuggestions(undefined)

      Analytics.trackEvent('summary.suggestions.fetch.start', { regenerate })

      const startTime = Date.now()
      let dataStream = ''
      const parser = new PartialJSONParser()

      // Initialize stream
      suggestionsStreamRef.current = suggestCommitmentsStream(
        [entry],
        (data) => {
          const goalSuggestions = parser.parse(data) as CollectionItemGoal[]

          // avoid parser quirks - seems to flip to an {} object initially
          if (isArray(goalSuggestions)) {
            setSuggestions(goalSuggestions)
          }

          dataStream = data
        },
        () => {
          const endTime = Date.now()
          Analytics.trackEvent('summary.suggestions.fetch.success', {
            duration: endTime - startTime,
            ...AnalyticsProps.openAiUsageProps(
              [entry],
              dataStream.length,
              kGPTModelMap.suggestCommitments
            ),
            regenerate,
          })
          setSuggestionsStreaming(false)
        }
      )

      // Start stream
      suggestionsStreamRef.current.start().catch((e) => {
        console.error(e)
        const endTime = Date.now()
        setSuggestionsStreaming(false)
        setError(kGenericErrorMessage)
        Analytics.trackEvent('summary.suggestions.fetch.error', {
          error: e.message,
          duration: endTime - startTime,
        })
      })
    },
    [entry, isSubscriptionActive, openSubscribeModal, suggestions]
  )

  /**
   * Process the entry (extract entities, reflection, etc.)
   */
  const processEntry = async () => {
    if (entryWordCount(entry) >= kMinWordsForReflection) {
      // If there are less than 20 words in the entry, don't generate reflection,
      // as it will hallucinate
      handleExtractEntities()
      handleStreamReflection()
    } else {
      setIsEntryTooShort(true)
    }
  }

  /**
   * Extract entities (emotions, people, themes, etc.)
   */
  const handleExtractEntities = useCallback(async () => {
    const startTime = Date.now()

    Analytics.trackEvent('summary.extractEntities.start')

    extractEntities([entry]).then(async ({ response, error }) => {
      if (error) {
        console.error(error)
        Analytics.trackEvent('summary.extractEntities.error', {
          error: error.message,
        })
        return
      }

      const endTime = Date.now()

      try {
        const responseLength = JSON.stringify(response).length
        Analytics.trackEvent('summary.extractEntities.success', {
          duration: endTime - startTime,
          ...AnalyticsProps.openAiUsageProps(
            [entry],
            responseLength,
            kGPTModelMap.extractEntities
          ),
        })
      } catch (e) {
        console.error(e)
      }

      const entities = response as Entities
      const tags = convertEntitiesToTags(entities)

      try {
        const fetchTagsPromises = () => {
          const existingTagQuery = []
          const chunkSize = 10

          for (let i = 0; i < tags.length; i += chunkSize) {
            const chunk = tags.slice(i, i + chunkSize).map((tag) => tag.title)
            existingTagQuery.push(
              fetchMany<CollectionItemTopic>('items', (q) =>
                query(q, where('title', 'in', chunk))
              )
            )
          }
          return existingTagQuery
        }

        const existingTags = (await Promise.all(fetchTagsPromises())).flat()

        // Create new tags
        const newTags = tags.filter(
          (tag) => !existingTags.find((t) => t.title === tag.title)
        ) as CollectionItemTopic[]

        // Create new tags
        if (newTags.length > 0) {
          await createRecordBatch<CollectionItemTopic>(
            'items',
            newTags.map((tag) => ({
              ...tag,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              metadata: {
                ...tag.metadata,
                mentions: 0,
              },
            }))
          )
        }

        // Fetch all tags if there are new tags to get their IDs
        const allTags: CollectionItemTopic[] =
          newTags.length > 0
            ? (await Promise.all(fetchTagsPromises())).flat()
            : existingTags

        // Add tags with ids to entry
        const updateEntry = updateRecord<Entry>('entries', entry.id!, {
          tags: tags.map((tag) => ({
            ...tag,
            id: allTags.find((t) => t.title === tag.title)?.id,
          })),
          tagIndex: arrayUnion(
            ...allTags.filter((tag) => tag.id).map((tag) => tag.id)
          ),
        })

        setEntities(allTags)

        // Increment mention count for each tag
        const updateMentionCount = updateRecordBatch<CollectionItemTopic>(
          'items',
          allTags.map((tag) => ({
            id: tag.id!,
            fieldPaths: {
              'metadata.mentions': increment(1),
            },
          }))
        )

        await Promise.all([updateEntry, updateMentionCount])
      } catch (e) {
        console.error(e)
        Analytics.trackEvent('summary.processTags.error', {
          error: e.message,
        })
      }
    })
  }, [entry])

  /**
   * Stream reflection from OpenAI
   * Manually split the response into title and content
   * TODO: Use markdown in the future?
   */
  const handleStreamReflection = useCallback(async () => {
    const startTime = Date.now()
    Analytics.trackEvent('summary.reflection.start')
    setReflection('')
    setReflectionError(false)
    let titleSet = false
    let dataStream = ''

    // Initialize stream
    reflectionStreamRef.current = entryReflection(
      { entries: [entry], templateId: entry.templateId ?? '' },
      (data: string) => {
        const newlineIndex = data.indexOf('\n')
        if (!titleSet) {
          const titleData = data.replace(/\n+/, '\n').split('\n')
          setReflectionTitle((prev) => (prev + titleData[0]).replace('"', ''))
          if (newlineIndex !== -1) {
            titleSet = true
          }
          if (titleData[1]) {
            setReflection((prev) => prev + titleData[1])
          }
        } else {
          setReflection((prev) => prev + data)
        }
        dataStream += data
      },
      () => {
        setReflectionDone(true)
        const endTime = Date.now()
        Analytics.trackEvent('summary.reflection.success', {
          duration: endTime - startTime,
          ...AnalyticsProps.openAiUsageProps(
            [entry],
            dataStream.length,
            kGPTModelMap.entryReflection
          ),
        })
      }
    )

    // Start stream
    reflectionStreamRef.current.start().catch((e) => {
      console.error(e)
      const endTime = Date.now()
      setReflectionError(true)
      Analytics.trackEvent('summary.reflection.error', {
        error: e.message,
        duration: endTime - startTime,
      })
    })
  }, [entry])

  const fetchStreakReward = useCallback(
    async (type?: CollectionItemType) => {
      if (!entry?.id || rewardStreaming || (rewardStreamRef.current && !type)) {
        return
      }

      Analytics.trackEvent('summary.streak.generateReward.start')
      const startTime = Date.now()
      let dataStream = ''

      const randomType: CollectionItemType =
        type ?? getRandomElement(['haiku', 'quote', 'affirmation', 'proverb'])

      const reward: CollectionItem = {
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        type: randomType,
        content: '',
        references: { entries: [entry.id!] },
      }

      rewardStreamRef.current = generateContent(
        [entry],
        randomType,
        (data) => {
          dataStream += data

          // Post-process quote content
          if (randomType === 'quote') {
            const parts = data?.split('-')
            if (parts?.length === 2) {
              data = `${parts[0].trim()}\n\n- ${parts[1].trim()}`
            }
          }

          reward.content = data
          setStreakReward(reward)
        },
        async () => {
          const endTime = Date.now()
          Analytics.trackEvent('summary.streak.generateReward.success', {
            duration: endTime - startTime,
            type: randomType,
            ...AnalyticsProps.openAiUsageProps(
              [entry],
              dataStream.length,
              getModelByContext('generateContent', isSubscriptionActive)
            ),
          })
          setRewardStreaming(false)
          // Save entry reward
          const docRef = await createRecord('items', reward)
          updateRecord('entries', entry.id!, {
            rewardId: docRef?.id,
          })
        }
      )

      setRewardStreaming(true)
      setRewardError(false)
      setStreakReward({ content: '', type: randomType })

      // Start stream
      rewardStreamRef.current.start().catch((e) => {
        console.error(e)
        const endTime = Date.now()
        setRewardStreaming(false)
        setRewardError(true)
        Analytics.trackEvent('summary.streak.generateReward.error', {
          error: e.message,
          duration: endTime - startTime,
        })
      })
    },
    [entry, isSubscriptionActive, rewardStreaming]
  )

  /**
   * Write entry summary to the database
   */
  useEffect(() => {
    if (reflectionDone) {
      updateRecord<Entry>('entries', entry.id!, {
        summary: {
          title: reflectionTitle.trim(),
          content: reflection,
        },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reflectionDone])

  /**
   * Add goal to entry
   */
  const handleAddGoal = useCallback(
    async (
      title: string,
      description: string,
      interval: CollectionItemGoalInterval,
      completionsRequired: number
    ): Promise<string | undefined> => {
      const goalId = await addGoal({
        type: 'goal',
        title,
        description,
        createdAt: Timestamp.now(), // TODO: was getFuzzyDate() ... why? is Timestamp.now() not ok?
        metadata: {
          interval,
          completionsRequired,
          completions: [],
        },
        references: {
          entries: [entry.id!],
        },
      })

      await updateRecord<Entry>('entries', entry.id!, {
        commitments: arrayUnion(title),
      })

      return goalId
    },
    [addGoal, entry.id]
  )

  /**
   * Remove goal
   */
  const handleRemoveGoal = useCallback(
    async (goalId: string, title: string) => {
      await deleteGoal(goalId)

      await updateRecord<Entry>('entries', entry.id!, {
        commitments: arrayRemove(title),
      })
    },
    [deleteGoal, entry.id]
  )

  /**
   * Post-exit cleanup
   * Cancel streams, and do specific post-processing for certain templates
   */
  const exitSummary = useCallback(async () => {
    // Cancel streams
    reflectionStreamRef.current?.cancel()
    suggestionsStreamRef.current?.cancel()

    const templateId = entry.templateId
    if (templateId) {
      // Delete the personal prompt if it's a prompt template
      if (templateId.startsWith('prompt')) {
        const promptId = templateId.split('-')[1]
        const drafts = await fetchMany<Entry>('drafts')

        // As long as this prompt isn't used in any saved drafts,
        // try deleting it from the prompts & items subcollection
        if (!isPromptUsedByDraftEntries(promptId, drafts)) {
          await deleteRecord('prompts', promptId)
          await deleteRecord('items', promptId)
        }
      }
    }

    const entriesToday = entries.filter(
      (e) => e.id !== entry.id && moment().isSame(e.date, 'day')
    )

    // Generate personalized prompts based on the entry
    // Only do it if the entry has 20 or more words, otherwise the prompts will hallucinate
    // This is also limited to only the first 2 entries of the day
    if (
      entryWordCount(entry) >= kMinWordsForReflection &&
      entriesToday.length < kPromptGenerationsPerDay
    ) {
      generatePersonalPrompts(entry)
    } else {
      Analytics.trackEvent('journal.generatePrompts', {
        limitExceeded: true,
      })
    }

    // Navigate back to the previous page
    if (returnTo) {
      router.push(returnTo, undefined, { shallow: true })
    } else {
      router.push(navigator.default, undefined, { shallow: true })
    }
  }, [entry, returnTo, generatePersonalPrompts, router, entries])

  /**
   * Context
   */
  const context = useMemo(
    () => ({
      entry,
      reflection,
      reflectionTitle,
      reflectionDone,
      reflectionError,
      entities,
      suggestions,
      streakReward,
      rewardError,
      isEntryTooShort,
      isStreak,
      fetchSuggestions,
      fetchStreakReward,
      exitSummary,
      retryReflection: handleStreamReflection,
      addGoal: handleAddGoal,
      removeGoal: handleRemoveGoal,
      suggestionsStreaming,
      rewardStreaming,
    }),
    [
      entry,
      reflection,
      reflectionTitle,
      reflectionDone,
      reflectionError,
      entities,
      suggestions,
      streakReward,
      rewardError,
      isEntryTooShort,
      isStreak,
      fetchSuggestions,
      fetchStreakReward,
      exitSummary,
      handleStreamReflection,
      handleAddGoal,
      handleRemoveGoal,
      suggestionsStreaming,
      rewardStreaming,
    ]
  )

  return (
    <SummaryProviderContext.Provider value={context}>
      {children}
      {error && (
        <AlertDialog
          title='😅 Uh oh!'
          message={error}
          confirmText={'OK'}
          onClose={() => setError(undefined)}
          isOpen={Boolean(error)}
        />
      )}
    </SummaryProviderContext.Provider>
  )
}
