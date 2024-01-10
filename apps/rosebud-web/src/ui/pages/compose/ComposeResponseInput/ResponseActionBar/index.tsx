import {
  ButtonGroup,
  Flex,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Spacer,
  Text,
  useToast,
} from '@chakra-ui/react'
import useWhisper from '@rising-tide-org/use-whisper'
import Analytics from 'lib/analytics'
import { useComposeProvider } from 'providers/ComposeProvider'
import { useSubscriptionProvider } from 'providers/SubscriptionProvider'
import { useUserProvider } from 'providers/UserProvider'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useWakeLock } from 'react-screen-wake-lock'
import { UserFlag } from 'types/User'
import CoachMark from 'ui/shared/CoachMark'
import { RbMicrophone, RbRegenerate } from 'ui/shared/Icon'
import { useComposeCoordinator } from '../../ComposeCoordinator'
import ActiveRecordingActionBar from '../ActiveRecordingActionBar'
import ResponseActionAidButton from './ResponseActionAidButton'
import { transcribeAudio } from 'net/openai'
import { captureException } from '@sentry/nextjs'
import MakeToast from 'ui/core/MakeToast'

const ResponseActionBar = () => {
  const { openSubscribeModal, isSubscriptionActive } = useSubscriptionProvider()
  const {
    isSupported: isWakeLockSupported,
    released: wakeLockReleased,
    request: requestWakeLock,
    release: releaseWakeLock,
  } = useWakeLock()
  const { user } = useUserProvider()
  const {
    updateActiveResponse,
    generatePrompts,
    responses,
    composeTemplate,
    isPromptsLoading,
    getSuggestions,
    activeResponse,
    journalMode,
  } = useComposeProvider()
  const { textAreaRef, recordingState, setRecordingState } =
    useComposeCoordinator()
  const [micPermissionStatus, setMicPermissionStatus] = useState<string | null>(
    null
  )
  const toast = useToast()
  const existingResponseText = useRef<string>('')

  const onTranscribe = async (blob: Blob) => {
    // Convert blob to base64
    const base64 = await new Promise<string | ArrayBuffer | null>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.readAsDataURL(blob)
    })
    const language = user.settings.locale ?? 'en'
    try {
      const { response, error } = await transcribeAudio(
        base64 as string,
        language
      )
      if (error) {
        return {
          blob,
          text: undefined,
        }
      }

      // We must return result from your server in Transcript format
      return {
        blob,
        text: response,
      }
    } catch (error) {
      captureException(error)
      return {
        blob,
        text: undefined,
      }
    }
  }

  /**
   * Initialize whisper
   * @see https://github.com/rising-tide-org/use-whisper
   */
  const {
    isTranscribingError,
    recording,
    speaking,
    transcript,
    transcribing,
    startRecording,
    stopRecording,
    clearTranscribingError,
    clearTranscript,
  } = useWhisper({
    streaming: true,
    timeSlice: 1_000,
    removeSilence: true,
    ffmpegCoreURL: `${window.location.protocol}//${window.location.host}/ffmpeg/ffmpeg-core.js`,
    onTranscribe,
  })

  // observe the microphone permissions
  useEffect(() => {
    const observeMicPermissions = async () => {
      try {
        const micPerm = await navigator.permissions.query({
          name: 'microphone' as PermissionName,
        })
        setMicPermissionStatus(micPerm.state)
        micPerm.onchange = () => setMicPermissionStatus(micPerm.state)
      } catch (e) {
        captureException(e)
        console.error(e)
      }
    }

    const clearMicPermissionsObserver = async () => {
      try {
        const micPerm = await navigator.permissions.query({
          name: 'microphone' as PermissionName,
        })
        micPerm.onchange = null
      } catch (e) {
        captureException(e)
        console.error(e)
      }
    }

    observeMicPermissions()
    return () => {
      clearMicPermissionsObserver()
    }
  }, [])

  // Update recording state only when recording starts
  useEffect(() => {
    if (recording) {
      setRecordingState('recording')
    }
  }, [recording, setRecordingState])

  // Update active response with transcribed text
  useEffect(() => {
    if (
      recordingState !== 'stopped' &&
      // don't accept transcriptions if recording is stopped
      // else late streaming results will override the final transcription
      transcript.text
    ) {
      updateActiveResponse([
        (
          (existingResponseText.current
            ? existingResponseText.current + ' '
            : '') + transcript.text
        ).trim(),
      ])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript, recordingState])

  /**
   * 1. Show warning if the final transcription failed
   * 2. Update active response with the final transcription
   * 3. Increase the height of the textarea
   * 4. Set recording state to stopped
   */
  useEffect(() => {
    if (!recording && !transcribing) {
      if (isTranscribingError) {
        Analytics.trackEvent('compose.record.transcribe.error')
        toast(
          MakeToast({
            title: 'Only a part of your recording was transcribed.',
            status: 'warning',
          })
        )
        clearTranscribingError()
      }
      if (transcript.text) {
        Analytics.trackEvent('compose.record.transcribe.success', {
          textLength: transcript.text.length,
        })
        updateActiveResponse([
          (
            (existingResponseText.current
              ? existingResponseText.current + ' '
              : '') + transcript.text
          ).trim(),
        ])
        clearTranscript() // to avoid appending outdated transcript after re-mount
      }
      let textarea
      if (textAreaRef.current) {
        textarea = textAreaRef.current
        textarea.style.height = textarea.scrollHeight + 'px'
      }
      setRecordingState('stopped')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcribing, recording, isTranscribingError])

  /**
   * Stop recording and transcribing, release wake lock
   */
  const handleStopRecording = useCallback(async () => {
    Analytics.trackEvent('compose.record.stop')
    await stopRecording()
    setRecordingState('transcribing')

    if (isWakeLockSupported && wakeLockReleased === false) {
      releaseWakeLock()
    }
  }, [
    stopRecording,
    setRecordingState,
    isWakeLockSupported,
    wakeLockReleased,
    releaseWakeLock,
  ])

  /**
   * Start recording and request wake lock
   */
  const handleStartRecording = useCallback(async (): Promise<void> => {
    if (
      !isSubscriptionActive &&
      !composeTemplate.settings?.allowVoiceForFreeUsers
    ) {
      openSubscribeModal('voice')
      return
    }
    Analytics.timeEvent('compose.record.stop')
    Analytics.trackEvent('compose.record.start')
    clearTranscript() // to avoid showing previous transcript in preview
    existingResponseText.current = activeResponse?.response?.[0] ?? ''
    await startRecording()

    if (isWakeLockSupported) {
      requestWakeLock('screen')
    }
  }, [
    isSubscriptionActive,
    composeTemplate.settings?.allowVoiceForFreeUsers,
    clearTranscript,
    activeResponse?.response,
    startRecording,
    isWakeLockSupported,
    openSubscribeModal,
    requestWakeLock,
  ])

  const renderRecordControls = () => {
    if (!composeTemplate.settings?.disableVoice) {
      return (
        <>
          {micPermissionStatus === 'denied' ? (
            <Popover isLazy placement='right'>
              <PopoverTrigger>
                <IconButton
                  aria-label='speak'
                  variant='ghost'
                  fontSize='14px'
                  icon={<RbMicrophone boxSize='20px' opacity={0.3} />}
                />
              </PopoverTrigger>
              <PopoverContent>
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverBody>
                  <Text>
                    You have denied microphone access. Please enable it to use
                    voice journaling.
                  </Text>
                </PopoverBody>
              </PopoverContent>
            </Popover>
          ) : (
            <IconButton
              onClick={handleStartRecording}
              aria-label='speak'
              variant='ghost'
              fontSize='14px'
              icon={<RbMicrophone boxSize='20px' />}
              isLoading={transcribing}
            />
          )}
        </>
      )
    }
  }

  return (
    <Flex align='center' w='full' flex={1} gap={4} mt={6}>
      {!recording ? (
        <ButtonGroup w='full'>
          {renderRecordControls()}
          <Spacer />
          {!transcribing && (
            <>
              {journalMode === 'interactive' &&
                !composeTemplate.settings?.disableSwapQuestion &&
                responses.length >= (composeTemplate.prompts.length ?? 0) && (
                  <CoachMark
                    flag={UserFlag.changeQuestionTipSeen}
                    prerequisites={[
                      UserFlag.suggestionsTipSeen,
                      UserFlag.finishEntryTipSeen,
                    ]}
                    isDisabled={composeTemplate.settings?.disableCoachMarks}
                  >
                    <IconButton
                      variant='ghost'
                      fontSize='14px'
                      icon={<RbRegenerate boxSize='18px' />}
                      isLoading={isPromptsLoading}
                      onClick={() => generatePrompts()}
                      aria-label='Change question'
                      isDisabled={Boolean(
                        activeResponse?.response?.[0]?.length
                      )}
                    />
                  </CoachMark>
                )}

              {composeTemplate.settings?.disableGuidingLight ? null : (
                <ResponseActionAidButton
                  onSelect={(type) => getSuggestions(type)}
                  disableCoachMark={composeTemplate.settings?.disableCoachMarks}
                />
              )}
            </>
          )}
        </ButtonGroup>
      ) : (
        <ActiveRecordingActionBar
          stopRecording={handleStopRecording}
          isRecording={transcribing}
          isSpeaking={speaking}
        />
      )}
    </Flex>
  )
}

export default ResponseActionBar
