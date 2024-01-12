import { kSessionEndText } from 'l10n/constants'
import { useComposeProvider } from 'providers/ComposeProvider'
import { useUserProvider } from 'providers/UserProvider'
import {
  createContext,
  createRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { ComposeRecordingState } from 'types/Compose'

import { kTopBarHeight } from 'shared/ui/constants'
import { isMobileDevice } from 'util/device'

/**
 * This hook coordinates the UI state of the Compose page
 * @returns
 */

type ComposeCoordinatorContextType = {
  responseRefs: React.RefObject<HTMLDivElement>[]
  activeResponseRef: React.RefObject<HTMLDivElement>
  inputOptionsRef: React.RefObject<HTMLDivElement>
  containerRef: React.RefObject<HTMLDivElement>
  textAreaRef: React.RefObject<HTMLTextAreaElement>
  canContinue: boolean // Whether or not the user can continue to the next prompt
  mustFinish: boolean // Whether or not the user must finish the session
  canSave: boolean // Whether or not the user can save the entry
  canSkip: boolean // Whether or not the user can skip ahead
  canToggleJournalMode: boolean // Whether or not the user can toggle journal mode
  progressValue: number // Progress value for the progress bar
  recordingState: ComposeRecordingState // Recording state for audio
  handleTextAreaChange: () => void
  moveCursorToEnd: () => void
  setRecordingState: (state: ComposeRecordingState) => void // Set the recording state
}

const kMinCharsToContinue = 1
const kComposeBottomPadding = 40 // px

export const ComposeCoordinatorContext =
  createContext<ComposeCoordinatorContextType>(
    {} as ComposeCoordinatorContextType
  )

/**
 * React hook that reads from `ComposeCoordinator` context
 * Returns modal disclosure control for generalized modals
 */
export const useComposeCoordinator = () => {
  const context = useContext(ComposeCoordinatorContext)
  if (context === undefined) {
    throw new Error(
      'useComposeCoordinator must be used within a ComposeCoordinator'
    )
  }
  return context
}

export function ComposeCoordinator({
  children,
}: {
  children: React.ReactNode
}) {
  const {
    responses,
    suggestions,
    activeResponse,
    composeTemplate,
    isLoading,
    isStreaming,
    journalMode,
    promptMode,
  } = useComposeProvider()

  const { user } = useUserProvider()
  const initializedRef = useRef(false)
  const responseRefs = responses.map(() => createRef<HTMLDivElement>())
  const activeResponseRef = createRef<HTMLDivElement>()
  const inputOptionsRef = createRef<HTMLDivElement>()
  const containerRef = createRef<HTMLDivElement>()
  const textAreaRef = createRef<HTMLTextAreaElement>()
  const timerRef = useRef<number>()
  const scrollTimeout = useRef<number>()

  /**
   * UI State
   */
  const [canContinue, setCanContinue] = useState(false)
  const [mustFinish, setMustFinish] = useState(false)
  const [canToggleJournalMode, setCanToggleJournalMode] = useState(true)
  const [progressValue, setProgressValue] = useState(0)
  const [recordingState, setRecordingState] =
    useState<ComposeRecordingState>('stopped')
  const finalPromptId =
    composeTemplate.prompts?.[composeTemplate.prompts.length - 1]?.id
  const isActivePromptRequired = activeResponse?.prompt?.isRequired
  const activeResponseLength = activeResponse?.response?.[0]?.length ?? 0

  /**
   * User can save after writing in the last template prompt
   * or they're on a prompt that's beyond the template (freeform)
   */
  const canSave = useMemo(() => {
    if (
      (responses.length === 0 && activeResponseLength === 0) ||
      (isActivePromptRequired && activeResponseLength === 0) ||
      recordingState !== 'stopped'
    ) {
      return false
    }

    // If the template controls the flow, the ability to save should be controlled by `mustFinish`
    // Unless it exceeds the estimated prompt count, a fallback for the AI failing to autofinish
    if (composeTemplate.finishMode === 'auto') {
      if (composeTemplate.estimatedPromptCount) {
        return (
          responses.length >= composeTemplate.estimatedPromptCount || mustFinish
        )
      }
      return mustFinish
    }

    if (composeTemplate.finishMode === 'always') {
      return true
    }

    // In the lastTemplatePrompt mode, we can save if we're on the
    // last prompt of the template or beyond
    if (composeTemplate.finishMode === 'lastTemplatePrompt') {
      const lastTemplatePrompt = composeTemplate.prompts.slice(-1)[0]
      const lastPromptIndex = responses.findIndex(
        (r) => r.prompt.id === lastTemplatePrompt.id
      )

      if (
        lastPromptIndex === -1 &&
        activeResponse?.prompt.id !== lastTemplatePrompt.id
      ) {
        return false
      }

      return responses.length > lastPromptIndex
    }

    // Custom flow for canSave is activated for shouldDoDigDeeperOnce flag
    // here we check if the user did at least one dig deeper by comparing props and responses length
    if (
      composeTemplate.minDigDeepers &&
      responses &&
      promptMode === 'freeform'
    ) {
      const lastTemplatePrompt = composeTemplate.prompts.slice(-1)[0]
      const responseIndex = responses.findIndex(
        (r) => r.prompt.id === lastTemplatePrompt.id
      )

      if (responseIndex > -1) {
        const numberOfDigDeepers = responses.length - (responseIndex + 1) + 1 // +1 because we want to include the last prompt
        return numberOfDigDeepers >= composeTemplate.minDigDeepers
      } else if (activeResponse?.prompt.id === lastTemplatePrompt.id) {
        const numberOfDigDeepers =
          responses.length -
          composeTemplate.prompts.findIndex(
            (r) => r.id === lastTemplatePrompt.id
          )
        return numberOfDigDeepers >= composeTemplate.minDigDeepers
      }
    }

    // If we're on the last prompt, and a character has been entered, we can save
    // Or, if we're on a prompt beyond the template, we can save
    return (
      (responses
        .concat(activeResponse ?? [])
        .find((r) => r.id === finalPromptId) &&
        activeResponseLength >= kMinCharsToContinue) ||
      (Boolean(activeResponse) &&
        !composeTemplate.prompts?.find((p) => p.id === activeResponse?.id))
    )
  }, [
    composeTemplate,
    mustFinish,
    responses,
    activeResponse,
    activeResponseLength,
    finalPromptId,
    promptMode,
    recordingState,
  ])

  /**
   * We can skip as long as we are not at the prompts that are being sent to open ai,
   * meaning you can skip only hardcoded prompts for analytics that are not included in entry
   */
  const canSkip = useMemo(() => {
    const promptIndex = [...responses, activeResponse].findIndex(
      (p) => p?.id === composeTemplate.entryBeginsAtPromptId
    )
    return promptIndex === -1
  }, [responses, activeResponse, composeTemplate.entryBeginsAtPromptId])

  /**
   * Calculate the point at which the container should snap to
   * when the user scrolls down or after submitting a response
   * Considers the height of the top bar
   */
  const getSnapPoint = useCallback((): number => {
    let snapPoint = 0
    const lastPrompt =
      responseRefs[responseRefs.length - 1]?.current ??
      activeResponseRef.current // Fall back to the active response if there are no previous responses

    if (containerRef.current && activeResponseRef.current) {
      // Input ref is either the active response or the input options
      const inputRef = activeResponseRef.current
      const containerHeight = containerRef.current.clientHeight
      const responseHeight = inputRef.clientHeight ?? 0
      const responseTop = inputRef.offsetTop
      const responseBottom = inputRef.offsetTop + responseHeight

      if (
        responseHeight + (lastPrompt?.clientHeight ?? 0) >
        containerHeight / 1.5
      ) {
        // If the response is taller than the container, scroll to the bottom of the response
        snapPoint = responseBottom - containerHeight + 300 // breathing room
      } else if (
        lastPrompt &&
        lastPrompt.clientHeight +
          inputRef.clientHeight +
          parseInt(kTopBarHeight) +
          kComposeBottomPadding >=
          containerHeight
      ) {
        // If the last prompt is taller than the container, scroll to the bottom
        snapPoint = responseTop - containerHeight / 4
      } else {
        // Otherwise, scroll to the top of the last response
        if (responses.length === 0) {
          snapPoint = containerRef.current.offsetTop
        } else {
          snapPoint = lastPrompt ? lastPrompt.offsetTop : responseBottom
        }
      }
    }

    snapPoint =
      snapPoint - parseInt(kTopBarHeight) - (responses.length > 0 ? 0 : 16) // TODO: Fix this magic number

    return snapPoint
  }, [responseRefs, activeResponseRef, containerRef, responses.length])

  /**
   * Scroll to the snap point
   */
  const scrollToSnapPoint = useCallback(() => {
    containerRef.current?.scrollTo({
      top: getSnapPoint(),
      behavior: 'smooth',
    })
  }, [containerRef, getSnapPoint])

  /**
   * Scroll to the bottom of the container after streaming
   */
  useEffect(() => {
    if (!isStreaming && initializedRef.current && !suggestions) {
      scrollToSnapPoint()
      if (!isMobileDevice()) {
        textAreaRef.current?.focus()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStreaming])

  /**
   * Prevent scrolling down beyond the content
   * Snap to the bottom when the user is at the bottom
   */
  useEffect(() => {
    const container = containerRef.current
    const lastPrompt =
      responseRefs[responseRefs.length - 1]?.current ??
      activeResponseRef.current

    if (!container || !lastPrompt) return

    const handleScroll = () => {
      // If we're at the bottom, prevent the browser's native bounce effect
      // Workaround: Omit this behavior while loading for very long posts
      const scrollBottom = container.scrollTop + container.clientHeight
      if (container.scrollHeight - scrollBottom < 1 && !isLoading) {
        container.scrollTop = container.scrollTop - 1
      }

      const activeResponseBottom =
        (activeResponseRef.current?.clientHeight ?? 0) +
        (activeResponseRef.current?.offsetTop ?? 0) -
        container.scrollTop

      // Only allow toggling journal mode if the user is not scrolled up
      setCanToggleJournalMode(
        activeResponseBottom < container.clientHeight - 100
      )

      // Only scroll to snap point after the user has stopped scrolling
      clearTimeout(scrollTimeout.current)
      scrollTimeout.current = window.setTimeout(() => {
        const snapPoint = getSnapPoint()
        const threshold = snapPoint - container.scrollTop

        if (threshold < 0) {
          scrollToSnapPoint()
        }
      }, 100)
    }

    container.addEventListener('scroll', handleScroll)

    return () => {
      container.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout.current)
    }
  }, [
    activeResponseRef,
    containerRef,
    getSnapPoint,
    isLoading,
    responseRefs,
    scrollToSnapPoint,
  ])

  /**
   * Scroll to the snap point when the prompt changes
   */
  useEffect(() => {
    if (!isStreaming || journalMode === 'focused') {
      scrollToSnapPoint()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responses])

  /**
   * Handle the visibility of the dig deeper button
   */
  const showActions = useCallback(
    (delay = false) => {
      const value = textAreaRef.current?.value ?? ''
      const activePrompt = activeResponse?.prompt

      if (!activePrompt) {
        return
      }

      const run = () => {
        const continueCriteriaMet: boolean = (() => {
          switch (activePrompt.input) {
            case 'text':
              return (
                value !== '' &&
                value.length >= kMinCharsToContinue &&
                recordingState === 'stopped'
              )
            case 'multi-select':
            case 'select':
              return (
                activeResponse.response.length > 0 &&
                activeResponse.response[0].length > 0
              )
            default:
              return true
          }
        })()

        setCanContinue(continueCriteriaMet)

        /**
         * If we detect the session end text, we let the UI know
         * that the user must finish the session
         */
        const mustFinishCriteriaMet: boolean = (() => {
          const promptIndex = composeTemplate.prompts.findIndex(
            (prompt) => prompt.id === activePrompt.id
          )
          if (promptIndex === -1) {
            const endText = kSessionEndText[user.settings.locale ?? 'en']
            const regex = new RegExp(endText, 'i')
            return Boolean(
              activeResponse.prompt.content.join('\n').match(regex)
            )
          }
          return false
        })()

        setMustFinish(mustFinishCriteriaMet)

        if (composeTemplate.shouldShowProgress) {
          const numberOfPrompts =
            composeTemplate.estimatedPromptCount ||
            composeTemplate.prompts.length

          // Calculate the progress based on the number of prompts
          // Estimated prompt count is used for templates that auto finish
          const progress = mustFinishCriteriaMet
            ? 1
            : Math.min(1, responses.length / numberOfPrompts)
          setProgressValue(progress)
        }
      }

      window.clearTimeout(timerRef.current)

      if (delay) {
        timerRef.current = window.setTimeout(() => {
          run()
        }, 500)
      } else {
        run()
      }
    },
    [
      activeResponse,
      textAreaRef,
      composeTemplate,
      responses.length,
      user.settings.locale,
      recordingState,
    ]
  )

  /**
   * Handle the textarea change
   */
  const handleTextAreaChange = useCallback(() => {
    if (suggestions && textAreaRef.current) {
      textAreaRef.current.value = ''
    }
  }, [suggestions, textAreaRef])

  /**
   * Move cursor to the end of textarea
   */
  const moveCursorToEnd = useCallback(() => {
    const textarea = textAreaRef.current
    if (textarea) {
      textarea.focus()
      textarea.selectionStart = textarea.value.length
      textarea.selectionEnd = textarea.value.length
    }
  }, [textAreaRef])

  /**
   * Update the text area when the active response changes
   */
  useEffect(() => {
    const textarea = textAreaRef.current
    if (!textarea) {
      return
    }
    textarea.value = activeResponse?.response[0] ?? ''
    // Hack to make the textarea resize to the content
    textarea.style.height = textarea.scrollHeight + 'px'
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeResponse, textAreaRef])

  /**
   * Reset the dig deeper button when the user submits a response
   */
  useEffect(() => {
    setCanContinue(false)
  }, [responses])

  /**
   * Disable the dig deeper button when the user is recording
   */
  useEffect(() => {
    showActions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordingState])

  /**
   * Move the cursor to the end of the textarea after clearing the prompt options
   */
  useEffect(() => {
    if (!suggestions && !isMobileDevice()) {
      moveCursorToEnd()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestions])

  /**
   * Show the dig deeper button when the the draft prompt response is loaded
   */
  useEffect(() => {
    if (!initializedRef.current) {
      showActions(false)
      moveCursorToEnd()
      initializedRef.current = true
    } else {
      showActions(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeResponse])

  /**
   * Context value
   */
  const context = useMemo(
    () => ({
      responseRefs,
      activeResponseRef,
      inputOptionsRef,
      containerRef,
      textAreaRef,
      canContinue,
      mustFinish,
      canSave,
      canSkip,
      canToggleJournalMode,
      progressValue,
      recordingState,
      handleTextAreaChange,
      moveCursorToEnd,
      setRecordingState,
    }),
    [
      responseRefs,
      activeResponseRef,
      inputOptionsRef,
      containerRef,
      textAreaRef,
      canContinue,
      mustFinish,
      canSave,
      canSkip,
      canToggleJournalMode,
      progressValue,
      recordingState,
      handleTextAreaChange,
      moveCursorToEnd,
    ]
  )

  return (
    <ComposeCoordinatorContext.Provider value={context}>
      {children}
    </ComposeCoordinatorContext.Provider>
  )
}
