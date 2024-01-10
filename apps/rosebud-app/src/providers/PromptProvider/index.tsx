import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'
import { generatePrompt } from 'net/openai'
import { Prompt } from 'types/Prompt'
import { Entry } from 'types/Entry'
import Analytics, { AnalyticsProps } from 'lib/analytics'
import useFetchMany from 'hooks/useFetchMany'
import { limit, query, orderBy, where } from 'firebase/firestore'
import { createRecordBatch, deleteRecordBatch, updateRecord } from 'db/mutate'
import { useUserProvider } from 'providers/UserProvider'
import { kGPTModelMap } from 'constants/models'
import { useEntryProvider } from 'providers/EntryProvider'
import { useSubscriptionProvider } from 'providers/SubscriptionProvider'
// import { PromptResponse } from 'pages/api/generatePrompt'
import moment from 'moment'
import { isPromptUsedByDraftEntries } from 'util/entries'
import { fetchMany } from 'db/fetch'

// TODO: should be replaced by shared type that can access the pages/api/generatePrompt
type PromptResponse = {
  question: string
  type: 'personal' | 'notification'
}

type PromptProviderContextType = {
  prompts: Prompt[] | undefined
  promptsLoading: boolean
  promptsGenerating: boolean
  promptsError?: string
  generatePersonalPrompts: (entry?: Entry) => void
  bookmarkPrompt: (prompt: Prompt) => void
  unbookmarkPrompt: (prompt: Prompt) => void
  toggleBookmark: (prompt: Prompt) => void
}

const defaultPromptContext = {} as PromptProviderContextType

export const PromptProviderContext =
  createContext<PromptProviderContextType>(defaultPromptContext)

/**
 * React hook that reads from `PromptProvider` context
 * Returns modal disclosure control for generalized modals
 */
export const usePromptProvider = () => {
  const context = useContext(PromptProviderContext)
  if (context === undefined) {
    throw new Error('usePromptProvider must be used within a PromptProvider')
  }
  return context
}

type Props = {
  children: ReactNode
}

export function PromptProvider({ children }: Props) {
  const { user } = useUserProvider()
  const { isSubscriptionActive, openSubscribeModal } = useSubscriptionProvider()
  const { entries } = useEntryProvider()
  const [promptsGenerating, setPromptsGenerating] = useState(false)
  const promptsLoadingRef = useRef(false)
  const [promptsError, setPromptsError] = useState<string | undefined>(
    undefined
  )

  // Fetch all prompts with a createdAt field
  // createdAt was introduced in v0.55.0
  // If a prompt doesn't have a createdAt field, it won't be returned in this query
  const { data: allPrompts, loading: promptsLoading } = useFetchMany<Prompt>(
    'prompts',
    (q) => query(q, orderBy('createdAt', 'desc'), limit(50)),
    { subscribe: true }
  )

  // fetch drafts as they may affect which prompts are shown
  const { data: drafts, loading: draftsLoading } = useFetchMany<Entry>(
    'drafts',
    query,
    { subscribe: true }
  )

  // Fetch all prompts without a createdAt field that are bookmarked
  const { data: oldBookmarkedPrompts, loading: bookmarkedPromptsLoading } =
    useFetchMany<Prompt>(
      'prompts',
      (q) => query(q, where('isBookmarked', '==', true), limit(1000)),
      { subscribe: true }
    )

  // Only return newer prompts that are suppose to be visible in the UI
  const visiblePrompts = useMemo(() => {
    // while loading, these are undefined
    if (!allPrompts || !drafts) return []

    return allPrompts
      .filter((p) => p.isVisible)
      .filter((p) => !isPromptUsedByDraftEntries(p.id, drafts))
      .sort(
        (a, b) =>
          moment(b.createdAt ?? '').seconds() -
          moment(a.createdAt ?? '').seconds()
      )
  }, [allPrompts, drafts])

  // Only return older prompts that are bookmarked
  const bookmarkedPrompts = useMemo(() => {
    if (!oldBookmarkedPrompts) return []

    return oldBookmarkedPrompts.filter((p) => !p.createdAt)
  }, [oldBookmarkedPrompts])

  const generateAndStorePrompts = useCallback(
    async (entry: Entry) => {
      Analytics.trackEvent('journal.generatePrompts', {
        limitExceeded: false,
      })
      const startTime = Date.now()

      try {
        const { response, error } = await generatePrompt(entry)

        if (error) {
          throw new Error(error.message)
        }

        // Keep the 3 most recent personal prompts
        // Delete any older personal prompts & all notification prompts
        if (allPrompts) {
          const drafts = await fetchMany<Entry>('drafts')

          // don't delete any prompts that are associated with a saved draft
          const nonDraftPrompts = allPrompts.filter((prompt) => {
            return !isPromptUsedByDraftEntries(prompt.id, drafts)
          })

          const notificationPrompts: Prompt[] = []
          const personalPrompts: Prompt[] = []

          nonDraftPrompts.forEach((p) => {
            if (p.type === 'notification') {
              notificationPrompts.push(p)
            } else if (p.type === 'personal') {
              personalPrompts.push(p)
            }
          })

          if (notificationPrompts.length) {
            await deleteRecordBatch(
              'prompts',
              notificationPrompts.map((p) => p.id)
            )
          }

          if (personalPrompts.length > 3) {
            // Delete all but the 3 most recent personal prompts
            await deleteRecordBatch(
              'prompts',
              personalPrompts.slice(personalPrompts.length - 2).map((p) => p.id)
            )
          }
        }

        // Store new prompts based on the type (personal or notification)
        const prompts = response as unknown as PromptResponse[]

        if (prompts?.length) {
          await createRecordBatch(
            'prompts',
            prompts?.map((prompt) => ({
              question: prompt?.question,
              type: prompt?.type,
              isVisible: prompt?.type === 'personal' ? true : false,
              createdAt: moment.utc().toString(),
            })) as Prompt[]
          )
        }

        Analytics.trackEvent('journal.generatePrompts.success', {
          duration: Date.now() - startTime,
          limitExceeded: false,
          ...AnalyticsProps.openAiUsageProps(
            [entry],
            JSON.stringify(prompts).length,
            kGPTModelMap.generatePersonalPrompts
          ),
        })

        setPromptsError(undefined)
      } catch (e) {
        Analytics.trackEvent('journal.generatePrompts.error', {
          limitExceeded: false,
          error: e.message || e,
        })

        setPromptsError(e.message)
      }
    },
    [user?.onboarding, allPrompts]
  )

  const generatePersonalPrompts = useCallback(
    (entry?: Entry) => {
      if (promptsLoadingRef.current) return

      const run = async () => {
        promptsLoadingRef.current = true
        setPromptsGenerating(true)

        await generateAndStorePrompts(entry || entries[0])

        setPromptsGenerating(false)
        promptsLoadingRef.current = false
        return
      }

      run()
    },
    [entries, generateAndStorePrompts]
  )

  const bookmarkPrompt = useCallback(async (prompt: Prompt) => {
    Analytics.trackEvent('prompts.bookmark')
    await updateRecord<Prompt>('prompts', prompt.id, { isBookmarked: true })
  }, [])

  const unbookmarkPrompt = useCallback(async (prompt: Prompt) => {
    Analytics.trackEvent('prompts.unbookmark')
    await updateRecord<Prompt>('prompts', prompt.id, { isBookmarked: false })
  }, [])

  const toggleBookmark = useCallback(
    (prompt: Prompt) => {
      if (!isSubscriptionActive) {
        openSubscribeModal('bookmarkButton')
        return
      }
      if (prompt.isBookmarked) {
        unbookmarkPrompt(prompt)
      } else {
        bookmarkPrompt(prompt)
      }
    },
    [isSubscriptionActive, openSubscribeModal, unbookmarkPrompt, bookmarkPrompt]
  )

  const context = useMemo(
    () => ({
      // Only return prompts that are suppose to be visible in the UI
      prompts: [...visiblePrompts, ...bookmarkedPrompts],
      promptsLoading:
        promptsLoading || bookmarkedPromptsLoading || draftsLoading,
      promptsGenerating,
      promptsError,
      generatePersonalPrompts,
      bookmarkPrompt,
      unbookmarkPrompt,
      toggleBookmark,
    }),
    [
      allPrompts,
      promptsLoading,
      promptsGenerating,
      promptsError,
      generatePersonalPrompts,
      bookmarkPrompt,
      unbookmarkPrompt,
      toggleBookmark,
    ]
  )

  return (
    <PromptProviderContext.Provider value={context}>
      {children}
    </PromptProviderContext.Provider>
  )
}
