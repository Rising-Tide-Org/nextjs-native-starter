import Analytics, { AnalyticsProps } from 'lib/analytics'
import moment from 'moment'
import { digDeeperStream, generatePromptsStream } from 'net/openai'
import { useRouter } from 'next/router'
import React, {
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
  ComposeResponse,
  ComposeTemplate,
  ComposePrompt,
  ComposeTemplatePrompt,
  ComposePromptMode,
  ComposeDraft,
  ComposeSuggestion,
  ComposeAidType,
} from 'types/Compose'
import { Entry } from 'types/Entry'
import { formatCurrentDate, getFuzzyDate } from 'util/date'
import { entriesFromComposeState } from 'util/entries'
import AlertDialog from 'ui/core/AlertDialog'
import { kGenericErrorMessage } from 'constants/error'
import navigator from 'lib/routes'
import { Template } from 'lib/template'
import useMutate from 'shared/hooks/useMutate'
import { useUserProvider } from 'providers/UserProvider'
import { JournalMode, UserFlag } from 'types/User'
import { kGPTModelMap } from 'constants/models'
import { fetchMemories, indexEntriesPinecone } from 'net/pinecone'
import { kComposeAidPrompts } from 'l10n/constants'
import { TimestampRange } from 'types/EntryVector'
import { useSubscriptionProvider } from 'providers/SubscriptionProvider'
import { ApiError } from 'next/dist/server/api-utils'
import { captureException } from '@sentry/nextjs'
import debounce from 'lodash/debounce'
import { kLSAppPrefix, kLSKeyForEntryDraft } from 'constants/localStorage'
import useLocalStorage from 'shared/hooks/useLocalStorage'
import { useToast } from '@chakra-ui/react'
import MakeToast from 'ui/core/MakeToast'

type ComposeProviderContextType = {
  composeTemplate: ComposeTemplate // Current compose template
  activeResponse?: ComposeResponse
  prompts: ComposeTemplatePrompt[] // Dig deeper prompts
  responses: ComposeResponse[] // Responses to the prompts
  isLoading: boolean // Loading state for prompts
  isPromptsLoading: boolean // Loading state for prompts
  isSaving: boolean // Saving state for entry
  isStreaming?: boolean // Streaming state for prompts
  suggestions?: ComposeSuggestion // Options for the current prompt
  promptMode: 'guided' | 'freeform' // Pilot for the current prompt
  journalMode: JournalMode // Journal mode for the current session
  hasPreviousSuggestions: boolean // Whether there are previous suggestions
  selectPrompt: (prompt: string) => void // Select a prompt option
  restorePreviousSuggestions: () => void // Restore previous suggestions
  submitResponse: () => void // Submit a response to the current prompt
  generateResponse: (
    newResponses: ComposeResponse[] | undefined,
    regenerate: boolean
  ) => void // Generate prompts based on responses
  generatePrompts: (
    newResponses?: ComposeResponse[],
    regenerate?: boolean
  ) => void // Generate prompts based on responses
  getSuggestions: (type: ComposeAidType) => void
  clearSuggestions: () => void // Clear prompt options
  updateActiveResponse: (response: string[]) => void // Update the active response
  skipToEntry: () => void // Skip to the entry when available
  saveEntry: (analyticsId: string) => void // Save the entry
  exitEntry: () => void // Exit the entry
}

export const ComposeProviderContext = createContext<ComposeProviderContextType>(
  {} as ComposeProviderContextType
)

/**
 * React hook that reads from `ComposeProvider` context
 * Returns modal disclosure control for generalized modals
 */
export const useComposeProvider = () => {
  const context = useContext(ComposeProviderContext)
  if (context === undefined) {
    throw new Error('useComposeProvider must be used within a ComposeProvider')
  }
  return context
}

type Props = {
  template: ComposeTemplate
  draft?: Entry
  memoryRange?: TimestampRange
  returnTo?: string
  onChange?: (responses: ComposeResponse[]) => void
  onSkip?: (responses: ComposeResponse[]) => void
  onSave?: (entryId: string | undefined, responses: ComposeResponse[]) => void
  children: ReactNode
}

export function ComposeProvider({
  template,
  draft: initialDraft,
  memoryRange,
  returnTo,
  onChange,
  onSkip,
  onSave,
  children,
}: Props) {
  const { user, setUserFlag } = useUserProvider()
  const { isSubscriptionActive, memoryEnabled, openSubscribeModal } =
    useSubscriptionProvider()
  const toast = useToast()
  const { createRecord: createEntry } = useMutate<Entry>('entries')
  const {
    createRecord: createDraft,
    updateRecord: updateDraft,
    deleteRecord: deleteDraft,
  } = useMutate<Entry>('drafts')

  const cloudDraft = useMemo(() => {
    if (initialDraft) {
      return {
        template,
        responses: initialDraft.questions,
      }
    }
  }, [initialDraft, template]) as ComposeDraft

  const [draft, setDraft] = useState<ComposeDraft>(cloudDraft)
  const [draftId, setDraftId] = useState<string | undefined>(initialDraft?.id)
  const [draftLoaded, setDraftLoaded] = useState(false)
  const initializedRef = useRef(false)
  const finalizedRef = useRef(false)

  const [isLoading, setIsLoading] = useState(false)
  const [isPromptsLoading, setIsPromptsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isStreaming, setIsStreaming] = useState<boolean | undefined>()
  const [showDraftAlert, setShowDraftAlert] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [prompts, setPrompts] = useState<ComposeTemplatePrompt[]>([])
  const [responses, setResponses] = useState<ComposeResponse[]>([])
  const [activeResponse, setActiveResponse] = useState<ComposeResponse>()

  const [suggestions, setSuggestions] = useState<ComposeSuggestion>()
  const [previousSuggestions, setPreviousSuggestions] =
    useState<ComposeSuggestion>()
  const [promptMode, setPromptMode] = useState<ComposePromptMode>('guided')
  const [journalMode, setJournalMode] = useState<JournalMode>(
    user.settings.journalMode
  )

  const streamingChangedRef = useRef<boolean>(false)
  const draftProcessingRef = useRef<boolean>(false)

  const localStorageKey = `${kLSAppPrefix}/${kLSKeyForEntryDraft}/${template.id}`

  // Temporary compose state in local storage
  const [lsDraft, setLsDraft] = useLocalStorage<ComposeDraft>(
    localStorageKey,
    {}
  )

  const router = useRouter()

  /**
   * Copy draft into local state from local storage
   * Prevent hydration mismatch
   */
  useEffect(() => {
    if (cloudDraft) {
      setDraft(cloudDraft)
    } else if (lsDraft.responses?.length) {
      // IF template is onboarding or cancel set draft from local storage
      if (template.settings?.draftMode !== 'local') {
        // This is a migration step for older drafts in LS
        // when theres no cloud draft but drafts in LS we pull them out, apply them and save to firestore
        recordEntryToDraftDebounced(lsDraft.responses)
      }
      setDraft(lsDraft)
    }
    if (!draftLoaded) {
      setDraftLoaded(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloudDraft, lsDraft])

  /**
   * Sync journal mode with user settings
   */
  useEffect(() => {
    if (template.finishMode !== 'auto') {
      setJournalMode(
        template.settings?.forceJournalMode ?? user.settings.journalMode
      )
    } else {
      setJournalMode('interactive')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.settings.journalMode])

  /**
   * Initialize the compose view
   *
   * If there is a draft, load the initial values from there
   * Otherwise, load the initial values from the template
   */
  useEffect(() => {
    if (!draftLoaded || initializedRef.current) {
      return
    }

    const run = async () => {
      let initialResponseValue: string[] = []
      let initialPrompt: ComposePrompt // Initial prompt (shown in prompt bar)

      // If there is a draft, load initial values and set the active question
      if (draft?.responses?.length) {
        let promptMode: ComposePromptMode = 'freeform'

        // Load the responses from the draft
        setResponses(draft.responses)

        // Notify parent of changes
        onChange?.(draft.responses)

        // Find the last response from the draft, and rebuild state from there
        const lastResponse = draft.responses[draft.responses.length - 1]
        const lastPromptIndex = template.prompts.findIndex(
          (q) => q.id === lastResponse.id
        )

        // Find the next template prompt
        const nextPrompt = Template.promptAfterPromptId(
          template,
          lastResponse.id,
          draft.responses
        )

        // Pop the last response and make it the active response
        draft.responses.pop()

        if (
          (lastPromptIndex > -1 && nextPrompt) ||
          template.finishMode === 'auto'
        ) {
          // If there are template questions remaining, stay in guided mode
          promptMode = 'guided'
        }

        // Set the active prompt
        initialPrompt = lastResponse.prompt
        initialResponseValue = lastResponse.response

        setPromptMode(promptMode)
      } else {
        initialPrompt = await Template.derivePrompt(template.prompts[0], [])
        // If there's only one question in the template, or the template is set to auto finish,
        // default to freeform mode
        initialResponseValue = template.initialResponse ?? [] // Adds initial response (used for Ask Rosebud)
        setPromptMode(
          template.prompts.length > 1 || template.finishMode === 'auto'
            ? 'guided'
            : 'freeform'
        )
      }

      // Set remaining initial values
      setActiveResponse(
        Template.createResponseForPrompt(initialPrompt, initialResponseValue)
      )
      setPrompts(template.prompts)

      // Mark initialized without triggering a re-render
      initializedRef.current = true

      setDraftLoaded(true)
    }

    run()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template, draftLoaded])

  /**
   * Responsible for saving the current state of the entry to user/drafts
   * sets the created draft id to the url, updates / creates drafts accordingly
   */
  const recordEntryToDraft = useCallback(
    async (draftResponses: ComposeResponse[]) => {
      if (draftProcessingRef.current) {
        return
      }

      draftProcessingRef.current = true
      const draftIdInUrl = (router.query.draft as string) ?? draftId

      const composedEntry: Entry = {
        ...entriesFromComposeState(draftResponses || [], [], template)[0],
        day: (router.query.day as string) || getFuzzyDate(),
        date: moment().toISOString(),
        // Override the template ID with the save ID, if it exists
        // Only used for the onboarding template right now
        templateId: template.saveId ?? template.id,
        isDraft: true,
      }

      try {
        if (!draftIdInUrl) {
          const createdDraft = await createDraft(composedEntry)
          if (!createdDraft?.id) {
            throw new Error("Draft doesn't have an ID")
          }
          setDraftId(createdDraft.id)
          router.query.draft = createdDraft?.id
          router.replace(router)
        } else {
          await updateDraft(draftIdInUrl, composedEntry)
        }
      } catch (error) {
        console.error(error)
        captureException(error)
      } finally {
        draftProcessingRef.current = false
      }
    },
    [router, draftId, template, createDraft, updateDraft]
  )

  const recordEntryToDraftDebounced = useCallback(
    debounce(recordEntryToDraft, 1000),
    [router.query.day, router.query.draft]
  )

  /**
   * Set the active response to the last response
   * TODO: Consider whether there's a better way to do this
   */
  const setActiveResponseToLastResponse = useCallback(
    (newResponses?: ComposeResponse[]) => {
      const responseSet = newResponses ?? responses
      if (responseSet.length) {
        setActiveResponse(responseSet[responseSet.length - 1])
        setResponses((prev) => prev.slice(0, prev.length - 1))
      }
    },
    [responses]
  )

  /**
   * Generate prompts
   */
  const generateResponse = useCallback(
    async (newResponses?: ComposeResponse[], regenerate = false) => {
      Analytics.trackEvent('compose.generateResponse', { regenerate })

      const allResponses = newResponses ?? responses

      const entries = entriesFromComposeState(allResponses, [], template)

      setSuggestions(undefined)
      setIsLoading(true)

      const startTime = Date.now()
      let dataStream = ''

      setActiveResponse(
        Template.createResponseForPrompt(Template.createStaticPrompt(''))
      )

      async function handleFetchMemories(
        responses: ComposeResponse[],
        topK?: number,
        memoryRange?: TimestampRange
      ): Promise<ComposeResponse[]> {
        const memories = await fetchMemories({ responses, topK, memoryRange })
        const flattened = memories.flatMap((m) => m.questions)
        Analytics.trackEvent('compose.memory.fetch.success', {
          memoryCount: memories.length,
          memoryLength: memoryLength(flattened),
        })
        return flattened
      }

      function memoryLength(memories: ComposeResponse[]): number {
        return memories
          .map((m) => m.prompt.content.join('\n') + m.response.join('\n'))
          .join('\n').length
      }

      let memories: ComposeResponse[] = []
      if (memoryEnabled) {
        try {
          // For initial response in Ask Rosebud, provide larger topK
          let topK = undefined
          if (Template.isAsk(template.id) && responses.length === 0) {
            topK = 15
          }
          // Fetch memories
          memories = await handleFetchMemories(allResponses, topK, memoryRange)
        } catch (e) {
          console.error(e)
          Analytics.trackEvent('compose.memory.fetch.error', {
            error: e.message,
          })
        }
      }

      try {
        Analytics.timeEvent('compose.generateResponse.firstStream')
        streamingChangedRef.current = false
        const { start } = digDeeperStream(
          {
            entries,
            memories,
            templateId: template.id,
            localDate: formatCurrentDate(),
          },
          (data: string) => {
            if (activeResponse) {
              setIsStreaming(true)
              const content = data
                .replace(/\n+/g, '\n')
                .replace(/\b(\d+)\./g, '$1#')
                .replace(/(!|\.)\s+/g, '$1\n')
                .replace(/(\d+)#/g, '$1.')
                .split('\n')
                .filter((line) => line.length > 0)
              setActiveResponse({
                response: [],
                prompt: Template.createStaticPrompt(content),
              })
              dataStream = data
            }

            if (streamingChangedRef.current === false) {
              Analytics.trackEvent('compose.generateResponse.firstStream')
              streamingChangedRef.current = true
            }

            setIsLoading(false)
          },
          async (data: string) => {
            if (data.includes('unable to provide ')) {
              Analytics.trackEvent('compose.generateResponse.refuse')
            }
          }
        )
        await start()

        if (dataStream.length === 0) {
          throw new Error('No response')
        }
      } catch (e) {
        console.error(e)
        const { statusCode } = e as ApiError
        Analytics.trackEvent('compose.generateResponse.error', {
          error: e.message,
          statusCode,
        })
        setIsLoading(false)
        setIsStreaming(false)
        setError(
          statusCode === 429
            ? 'You have exceeded your daily usage quota. Please try again tomorrow.'
            : kGenericErrorMessage
        )
        setActiveResponseToLastResponse(newResponses)
        return
      }

      const endTime = Date.now()
      setIsStreaming(false)

      Analytics.trackEvent('compose.generateResponse.success', {
        duration: endTime - startTime,
        ...AnalyticsProps.openAiUsageProps(
          entries,
          dataStream.length,
          kGPTModelMap.digDeeper
        ),
        regenerate,
        memoryLength: memoryLength(memories),
      })
    },
    [
      activeResponse,
      memoryEnabled,
      responses,
      setActiveResponseToLastResponse,
      template,
      user.settings.entryChunkingMode,
    ]
  )

  /**
   * Generate prompts
   */
  const generatePrompts = useCallback(
    async (newResponses?: ComposeResponse[], regenerate = false) => {
      const entries = entriesFromComposeState(
        newResponses ?? responses,
        [],
        template
      )

      setSuggestions(undefined)
      setIsPromptsLoading(true)

      Analytics.trackEvent('compose.generatePrompts', { regenerate })

      const startTime = Date.now()

      let dataStream = ''

      try {
        setIsStreaming(true)

        try {
          const { start } = generatePromptsStream(entries, (data: string) => {
            // Cleanup: remove non-options
            const options = data
              .replace(/\n+/g, '\n')
              .split('\n')
              .map((o) => o.trim())

            if (options.length === 0) {
              options.push('')
            }

            setIsPromptsLoading(false)
            setSuggestions({
              type: 'prompts',
              options,
            })

            dataStream = data
          })
          await start()
        } catch (e) {
          throw new Error(e.message)
        }

        if (dataStream.length === 0) {
          throw new Error('Empty response')
        }
      } catch (e) {
        console.error(e)
        Analytics.trackEvent('compose.generatePrompts.error', {
          error: e.message,
        })
        setIsPromptsLoading(false)
        setIsStreaming(false)
        if (journalMode === 'focused') {
          setActiveResponseToLastResponse(newResponses)
        }
        setError(kGenericErrorMessage)
        return
      }

      const endTime = Date.now()
      setIsStreaming(false)

      Analytics.trackEvent('compose.generatePrompts.success', {
        duration: endTime - startTime,
        ...AnalyticsProps.openAiUsageProps(
          entries,
          dataStream.length,
          kGPTModelMap.generatePrompts
        ),
        regenerate,
      })
    },
    [responses, setActiveResponseToLastResponse, template, journalMode]
  )

  /**
   * Restore previous suggestions
   */
  const restorePreviousSuggestions = useCallback(() => {
    if (previousSuggestions) {
      setSuggestions(previousSuggestions)
      setPreviousSuggestions(undefined)
    }
  }, [previousSuggestions])

  /**
   * Clear prompt options (e.g. Cancel when picking a prompt)
   */
  const clearSuggestions = useCallback(() => {
    if (journalMode === 'focused') {
      setActiveResponseToLastResponse()
    }
    setSuggestions(undefined)
  }, [setActiveResponseToLastResponse, journalMode])

  /**
   * Update the active response draft
   */
  const updateActiveResponse = useCallback(
    (response: string[]) => {
      if (activeResponse) {
        setActiveResponse({
          ...activeResponse,
          response,
        })
      }
    },
    [activeResponse]
  )

  /**
   * Update the draft as things change
   */
  useEffect(() => {
    if (finalizedRef.current) {
      // Don't save draft if we've saved the final version
      return
    }

    const draftResponses = [...responses]
    if (activeResponse) {
      draftResponses.push(activeResponse)
    }

    // Do not save to draft if no responses, or no active response with content or if the template is onboarding or cancel
    if (!(responses.length || activeResponse?.response?.[0]?.length)) {
      return
    }

    if (template.settings?.draftMode === 'local') {
      setLsDraft({
        template,
        responses: draftResponses,
      })
    } else {
      recordEntryToDraftDebounced(draftResponses)
    }
  }, [
    activeResponse,
    router.query.day,
    responses,
    template,
    setLsDraft,
    recordEntryToDraftDebounced,
  ])

  /**
   * Set a day query param if draft doesn't have the same day as today and is editing a draft
   */
  useEffect(() => {
    // Do nothing if is not a draft or day is defined in the url
    if (!initialDraft || router.query.day) return

    const draftDay = initialDraft?.day
    const isDraftDayIsToday = moment().isSame(draftDay, 'day')

    if (!isDraftDayIsToday) {
      router.query.day = draftDay
      router.replace(router)
    }
  }, [])

  /**
   * Select a prompt
   */
  const selectPrompt = useCallback(
    (prompt: string) => {
      if (journalMode === 'focused') {
        setActiveResponse(
          Template.createResponseForPrompt(Template.createStaticPrompt(prompt))
        )
      } else if (activeResponse) {
        const currentPrompt = activeResponse?.prompt.content ?? []
        const lastQuestion = currentPrompt.slice(-1)[0]
        const newPrompt = [
          ...currentPrompt.slice(0, currentPrompt.length - 1),
          prompt,
        ]

        setActiveResponse({
          ...activeResponse,
          prompt: {
            ...activeResponse.prompt,
            content: newPrompt,
          },
        })
        suggestions?.options.push(lastQuestion)
      }

      setPreviousSuggestions(suggestions)
      setSuggestions(undefined)
    },
    [activeResponse, suggestions, journalMode]
  )

  /**
   * Stage a response, which moves it from the active response to the list of responses
   * and saves it to local storage — this can be reverted to resume editing
   * @returns The new list of responses
   */
  const stageResponse = useCallback((): ComposeResponse[] => {
    if (!activeResponse) {
      return responses
    }

    const newResponses = [...responses, activeResponse]

    setResponses(newResponses)
    setActiveResponse(undefined)

    if (template.settings?.draftMode === 'local') {
      setLsDraft({
        template,
        responses: newResponses,
      })
    }

    onChange?.(newResponses)

    return newResponses
  }, [activeResponse, onChange, responses, setLsDraft, template])

  /**
   * Get suggestions (guiding light)
   */

  const getSuggestions = useCallback(
    async (type: ComposeAidType) => {
      Analytics.trackEvent('compose.getSuggestions', { type })
      setPreviousSuggestions(undefined)
      setUserFlag(UserFlag.suggestionsTipSeen, true)
      const responses = stageResponse()

      // Here we inject a prompt to instruct the AI to provide suggestions
      // but it is not saved to the draft or visible to the user
      await generateResponse([
        ...responses,
        {
          prompt: {
            content: [''],
            input: 'text',
            contentType: 'static',
          },
          response: [kComposeAidPrompts[type][user.settings.locale ?? 'en']],
        },
      ])
    },
    [generateResponse, setUserFlag, stageResponse, user.settings.locale]
  )

  /**
   * Submit a response
   */
  const submitResponse = useCallback(() => {
    // Limit dig deepers when necessary
    if (activeResponse) {
      if (
        !Template.canDigDeeper(isSubscriptionActive, template, responses.length)
      ) {
        if (!isSubscriptionActive) {
          openSubscribeModal('digDeeperLimitReached')
        }
        return
      }

      const newResponses = stageResponse()
      setPreviousSuggestions(undefined)

      // Find the next question, if any
      if (activeResponse.id) {
        const nextPrompt = Template.promptAfterPromptId(
          template,
          activeResponse.id,
          newResponses
        )
        const promptAfterNext = Template.promptAfterPromptId(
          template,
          nextPrompt?.id,
          newResponses
        )

        // If this is the last template prompt, switch to AI mode
        if (!promptAfterNext && template.finishMode !== 'auto') {
          setPromptMode('freeform')
        }

        // If there's a next prompt, switch to it
        if (nextPrompt) {
          setIsLoading(true)

          // Set a delay to simulate AI thinking
          window.setTimeout(() => {
            Template.derivePrompt(nextPrompt, newResponses).then((prompt) => {
              setActiveResponse(Template.createResponseForPrompt(prompt))
              setIsLoading(false)
            })
          }, 250)
          return
        }
      }

      // Otherwise, generate prompts or a response
      if (journalMode === 'focused') {
        generatePrompts(newResponses)
      } else {
        generateResponse(newResponses)
      }
    }
  }, [
    activeResponse,
    isSubscriptionActive,
    template,
    responses.length,
    stageResponse,
    journalMode,
    openSubscribeModal,
    generatePrompts,
    generateResponse,
  ])

  /**
   * Exit entry — this handles the logic for exiting the entry, including discarding the draft
   * @param force Force exit, even if there are responses
   * @param discard Discard the draft
   */
  const exitEntry = useCallback(
    async ({
      force = false,
      discard = false,
    }: {
      force?: boolean
      discard?: boolean
    } = {}) => {
      // If there are responses, show a confirmation dialog
      // and offer to save a draft
      if (
        !force &&
        !template.settings?.dontSaveEntry &&
        (responses.length > 0 ||
          (activeResponse && activeResponse?.response?.[0]?.length > 0))
      ) {
        setShowDraftAlert(true)
        return
      }

      // If it's empty, discard the draft
      if (
        discard ||
        template.settings?.dontSaveEntry ||
        (responses.length === 0 && activeResponse?.response?.length === 0)
      ) {
        await deleteDraft(router.query.draft as string)

        if (discard) {
          toast(
            MakeToast({
              title: 'Draft discarded',
              status: 'success',
            })
          )
        }
      } else if (activeResponse && activeResponse?.response?.[0]?.length > 0) {
        // If there's an active response, the draft has already been saved
        toast(
          MakeToast({
            title: 'Draft saved to Entries',
            status: 'success',
          })
        )
      }

      if (returnTo) {
        router.push(returnTo, undefined, { shallow: true })
      } else {
        if (window.history.length > 2) {
          router.back()
        } else {
          router.push(navigator.default, undefined, { shallow: true })
        }
      }

      // Regarding of params we want to discard LS draft to prevent it
      // from being loaded when user comes back to new compose
      localStorage.removeItem(localStorageKey)
    },
    [
      activeResponse,
      deleteDraft,
      localStorageKey,
      responses.length,
      returnTo,
      router,
      template.settings?.dontSaveEntry,
      toast,
    ]
  )

  /**
   * Save entry
   */
  const saveEntry = useCallback(
    async (analyticsId: string) => {
      if (!responses) {
        return
      }

      // If there's an active response, add it to the list of responses
      const allResponses = [...responses]
      if (activeResponse) {
        allResponses.push(activeResponse)
      }

      const entryDay = (router.query.day as string) ?? getFuzzyDate()

      const newEntry: Entry = {
        ...entriesFromComposeState(allResponses, [], template)[0],
        day: entryDay,
        date: moment().toISOString(),
        // Override the template ID with the save ID, if it exists
        // Only used for the onboarding template right now
        templateId: template.saveId ?? template.id,
      }

      let entryId: string | undefined = undefined

      // Try to save to the database
      // If there's a failure, show an error message and don't navigate away
      try {
        setIsSaving(true)

        if (!template.settings?.dontSaveEntry) {
          const entry = await createEntry(newEntry)

          if (entry) {
            entryId = entry.id
          } else {
            throw new Error('Entry not created')
          }

          // Remove draft on successful entry creation
          if (router.query.draft) {
            deleteDraft(router.query.draft as string)
          }

          // Index entry in vector database
          newEntry.id = entryId
          await indexEntriesPinecone([newEntry])

          if (template.id.includes('onboarding')) {
            Analytics.trackEvent('onboarding.complete', {
              variant: template.id,
              responses: user.onboarding,
            })
            await setUserFlag(UserFlag.onboardingComplete, true)
          }
        }

        // At the end of the entry, we dispatch this to track the duration of the last prompt submitted
        Analytics.trackEvent('compose.prompt.submit', {
          ...AnalyticsProps.entryProps(newEntry),
          template: template.id,
          source: template.analyticsId ?? template.id,
          metadata: template.metadata,
          mode: journalMode,
          savedFrom: analyticsId,
          step: responses.length,
          lengthPrompt: activeResponse?.response?.join('')?.length,
        })

        // TODO: should this be recorded for all types of templates? eg cancel template
        Analytics.trackEvent('journal.save.success', {
          ...AnalyticsProps.entryProps(newEntry),
          template: template.id,
          source: template.analyticsId ?? template.id,
          metadata: template.metadata,
          mode: journalMode,
          savedFrom: analyticsId,
          step: responses.length,
        })
      } catch (error) {
        Analytics.trackEvent('journal.save.error', {
          ...AnalyticsProps.entryProps(newEntry),
          error: error?.message,
          metadata: template.metadata,
          mode: journalMode,
          savedFrom: analyticsId,
        })
        setError(kGenericErrorMessage)
        setIsSaving(false)
        return
      }

      // Remove draft & finalize
      finalizedRef.current = true
      await deleteDraft(router.query.draft as string)
      localStorage.removeItem(localStorageKey)

      // Propagate the new entry to the parent component
      onSave?.(entryId, allResponses)
    },
    [
      responses,
      activeResponse,
      router.query.day,
      router.query.draft,
      template,
      deleteDraft,
      localStorageKey,
      onSave,
      journalMode,
      createEntry,
      user.onboarding,
      setUserFlag,
    ]
  )

  /**
   * Skip to where the entry begins for templates that support it
   */
  const skipToEntry = useCallback(async () => {
    if (template.entryBeginsAtPromptId) {
      const templatePrompt = template.prompts.find(
        (q) => q.id === template.entryBeginsAtPromptId
      )
      if (templatePrompt) {
        const prompt = await Template.derivePrompt(templatePrompt, responses)
        setActiveResponse(Template.createResponseForPrompt(prompt))

        const promptAfterNext = Template.promptAfterPromptId(
          template,
          prompt.id,
          responses
        )

        // If this is the last template prompt, switch to AI mode
        if (!promptAfterNext) {
          setPromptMode('freeform')
        }
      }
      onSkip?.(responses)
    }
  }, [onSkip, responses, template])

  /**
   * Whether there are previous suggestions
   */
  const hasPreviousSuggestions = useMemo(
    () => Boolean(previousSuggestions),
    [previousSuggestions]
  )

  /**
   * Context value
   */
  const context = useMemo(
    () => ({
      composeTemplate: template,
      activeResponse,
      responses,
      prompts,
      isLoading,
      isPromptsLoading,
      isSaving,
      isStreaming,
      getSuggestions,
      clearSuggestions,
      restorePreviousSuggestions,
      hasPreviousSuggestions,
      suggestions,
      promptMode,
      journalMode,
      submitResponse,
      generateResponse,
      generatePrompts,
      selectPrompt,
      updateActiveResponse,
      skipToEntry,
      saveEntry,
      exitEntry,
    }),
    [
      template,
      activeResponse,
      responses,
      prompts,
      isLoading,
      isPromptsLoading,
      isSaving,
      isStreaming,
      getSuggestions,
      clearSuggestions,
      restorePreviousSuggestions,
      hasPreviousSuggestions,
      suggestions,
      promptMode,
      journalMode,
      submitResponse,
      generateResponse,
      generatePrompts,
      selectPrompt,
      updateActiveResponse,
      skipToEntry,
      saveEntry,
      exitEntry,
    ]
  )

  return (
    <ComposeProviderContext.Provider value={context}>
      {children}
      {error && (
        <AlertDialog
          title='😅 Uh oh!'
          message={error}
          confirmText={'OK'}
          onClose={() => setError(null)}
          isOpen={Boolean(error)}
        />
      )}
      {showDraftAlert && (
        <AlertDialog
          isOpen={showDraftAlert}
          title='Unsaved Changes'
          message='You have unsaved changes. Are you sure you want to exit?'
          confirmText='Save draft'
          cancelText='Discard changes'
          onClose={() => setShowDraftAlert(false)}
          onConfirm={() => exitEntry({ force: true })}
          onCancel={() => exitEntry({ force: true, discard: true })}
        />
      )}
    </ComposeProviderContext.Provider>
  )
}
