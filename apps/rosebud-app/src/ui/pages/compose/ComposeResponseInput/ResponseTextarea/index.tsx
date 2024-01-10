import { Textarea } from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import ResizeTextarea from 'react-textarea-autosize'
import { useComposeProvider } from 'providers/ComposeProvider'
import { useComposeCoordinator } from '../../ComposeCoordinator'
import { isMobileDevice } from 'util/device'
import Analytics from 'lib/analytics'

const ResponseTextarea = () => {
  const promptChangedRef = useRef<number | undefined>()
  const streamingChangedRef = useRef<boolean | undefined>()
  const { activeResponse, responses, updateActiveResponse, submitResponse } =
    useComposeProvider()
  const { isStreaming } = useComposeProvider()
  const { textAreaRef, handleTextAreaChange, recordingState } =
    useComposeCoordinator()

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      let value = e.target.value

      // Because we keep the same text input for all of the prompt questions we need to make
      // sure that we only track each prompt once
      if (responses.length !== promptChangedRef.current) {
        promptChangedRef.current = responses.length
        Analytics.trackEvent('compose.prompt.firstLetter', {
          id: activeResponse?.prompt.id,
          step: responses.length,
          template: activeResponse?.id,
        })
      }

      // This is a hack to get around iOS behavior, ugh
      // When we reset the text area by setting ref.value = '', the first letter is not capitalized
      // When we do this, we need to also manually maintain the cursor position
      if (
        isMobileDevice() &&
        textAreaRef.current &&
        textAreaRef.current.selectionStart > 0 // This prevents auto-capitalization after deleting the first letter
      ) {
        const cursorPosition = textAreaRef.current.selectionStart
        value = value.charAt(0).toUpperCase() + value.slice(1)
        textAreaRef.current.value = value
        textAreaRef.current.selectionStart = cursorPosition
        textAreaRef.current.selectionEnd = cursorPosition
      }

      handleTextAreaChange()
      updateActiveResponse([value])
    },
    [
      activeResponse?.id,
      activeResponse?.prompt.id,
      handleTextAreaChange,
      responses.length,
      textAreaRef,
      updateActiveResponse,
    ]
  )

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault()
      submitResponse()
    }
  }

  const handleAnalyticsEvents = () => {
    Analytics.timeEvent('compose.prompt.firstLetter')
    Analytics.timeEvent('compose.prompt.submit')
  }

  const handleTextAreaFocus = () => {
    // If the user has streamed means they did at least 1 dig deeper meaning from that point on
    // we can trigger these events based on the streaming state
    // this prevents us from triggering this focus events on user clicking input in/out of focus continuously
    // instead we record only time from steaming end to first letter and submit
    if (streamingChangedRef.current === undefined) {
      // When user focuses on the input themselves, we want to count time to first letter and submit as well
      handleAnalyticsEvents()
    }
  }

  useEffect(() => {
    // When streaming switches from true to false, we know the responsed stopped steaming and the input is focused
    // here we want to dispatch firstLetter and timeToSubmit to account for digDeeper type prompts
    if (streamingChangedRef.current === true && isStreaming === false) {
      handleAnalyticsEvents()
    }
    streamingChangedRef.current = isStreaming
  }, [isStreaming])

  const placeholder = useMemo(() => {
    if (recordingState === 'recording') {
      return 'Listening...'
    } else if (recordingState === 'transcribing') {
      return 'Transcribing...'
    }
    return activeResponse?.prompt.placeholder ?? 'Write...'
  }, [recordingState, activeResponse?.prompt.placeholder])

  return (
    <Textarea
      data-testid='compose-response-input'
      data-sentry-block
      as={ResizeTextarea}
      placeholder={placeholder}
      border={0}
      px={0}
      defaultValue={activeResponse?.response[0]}
      ref={textAreaRef}
      minRows={3}
      fontSize='17px'
      lineHeight={1.37}
      resize='none'
      minH='unset'
      onChange={handleTextChange}
      overflow='hidden'
      onKeyDown={handleKeyDown}
      onFocus={handleTextAreaFocus}
      isDisabled={recordingState !== 'stopped'}
    />
  )
}

export default ResponseTextarea
