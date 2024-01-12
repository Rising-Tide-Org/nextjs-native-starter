import { Flex, Box, Button, ButtonGroup, Divider } from '@chakra-ui/react'
import { AnimatePresence } from 'framer-motion'
import PromptLabel from '../PromptLabel'
import { useComposeProvider } from 'providers/ComposeProvider'
import { useMemo, useCallback, useEffect } from 'react'
import { useComposeCoordinator } from '../ComposeCoordinator'
import { RbCheckmark, RbGoDeeper } from 'ui/shared/Icon'
import ResponseInputSelect from './ResponseInputSelect'
import CoachMark from 'ui/shared/CoachMark'
import { UserFlag } from 'types/User'
import ResponseTextarea from './ResponseTextarea'
import { Template } from 'lib/template'
import { kOptionSlideInTransition } from 'shared/ui/constants'
// import ResponseActionBar from './ResponseActionBar'
import ComposeSuggestions from '../ComposeSuggestions'
import { isMobileDevice } from 'util/device'
import { useSubscriptionProvider } from 'providers/SubscriptionProvider'
import Analytics from 'lib/analytics'

const ComposeResponseInput = () => {
  const {
    composeTemplate,
    responses,
    activeResponse,
    suggestions,
    promptMode,
    isLoading,
    isPromptsLoading,
    restorePreviousSuggestions,
    submitResponse,
    hasPreviousSuggestions,
    isStreaming,
    isSaving,
    saveEntry,
  } = useComposeProvider()
  const { hideIcon, ...finishButtonProps } =
    composeTemplate.finishButtonStyle ?? {}
  const { isSubscriptionActive } = useSubscriptionProvider()
  const {
    activeResponseRef,
    textAreaRef,
    canContinue,
    mustFinish,
    canSave,
    moveCursorToEnd,
  } = useComposeCoordinator()

  /**
   * Hide the text area when there are prompt options or when loading
   */
  const hideResponseInput = useMemo(() => {
    return suggestions || isLoading
  }, [isLoading, suggestions])

  /**
   * Move the textarea off screen to maintain control of focus
   */
  const hideTextArea = useMemo(
    () => activeResponse?.prompt.input !== 'text' || isStreaming || mustFinish,
    [activeResponse?.prompt.input, isStreaming, mustFinish],
  )

  const digDeeperLimitReached = useMemo(
    () =>
      !Template.canDigDeeper(
        isSubscriptionActive,
        composeTemplate,
        responses?.length,
      ),
    [composeTemplate, isSubscriptionActive, responses],
  )

  const premiumDigDeeperLimitReached = useMemo(
    () => digDeeperLimitReached && isSubscriptionActive,
    [digDeeperLimitReached, isSubscriptionActive],
  )

  /**
   * Submit a response to the current prompt
   * Can be text, multi-select, select etc.
   */
  const handleSubmitResponse = useCallback(() => {
    Analytics.trackEvent('compose.prompt.submit', {
      id: activeResponse?.prompt.id,
      step: responses.length,
      template: activeResponse?.id,
      lengthPrompt: activeResponse?.response?.join('')?.length,
    })

    const nextPrompt = Template.promptAfterPromptId(
      composeTemplate!,
      activeResponse?.prompt.id,
      responses,
    )
    const value = textAreaRef.current?.value ?? ''

    // Reset the text area
    if (textAreaRef.current) {
      textAreaRef.current.value = ''
    }

    // Focus the text area if the current or next prompt is text
    if (
      ((activeResponse?.prompt.input === 'text' && !isMobileDevice()) ||
        (nextPrompt && nextPrompt.input === 'text')) &&
      textAreaRef.current !== document.activeElement
    ) {
      moveCursorToEnd()
    }

    // If the current prompt is text and the text area is empty, do nothing
    if (activeResponse?.prompt.input === 'text' && !value) {
      return
    }

    if (canContinue) {
      submitResponse()
    }
  }, [
    activeResponse?.prompt.id,
    activeResponse?.prompt.input,
    activeResponse?.id,
    activeResponse?.response,
    responses,
    composeTemplate,
    textAreaRef,
    canContinue,
    moveCursorToEnd,
    submitResponse,
  ])

  /**
   * Start streaming as soon as user lands on
   * compose view (eg. used for Ask Rosebud feature)
   */
  useEffect(() => {
    if (
      composeTemplate.settings?.digDeeperOnInitialResponse &&
      !isLoading &&
      responses.length === 0 &&
      activeResponse &&
      activeResponse.response.length
    ) {
      handleSubmitResponse()
    }
  }, [
    isLoading,
    composeTemplate.settings?.digDeeperOnInitialResponse,
    responses,
    activeResponse,
    handleSubmitResponse,
  ])

  /**
   * Set the button label based on the prompt mode
   */
  const buttonLabel = useMemo(() => {
    if (activeResponse?.prompt.buttonLabel) {
      return activeResponse.prompt.buttonLabel
    }
    return promptMode === 'freeform' ? 'Go deeper' : 'Continue'
  }, [activeResponse?.prompt.buttonLabel, promptMode])

  const responseContent = useMemo(() => {
    // When we're swapping questions, remove the last line of the response
    const responseContent = activeResponse?.prompt.content
    if ((suggestions || isPromptsLoading) && responseContent) {
      return responseContent?.slice(0, responseContent.length - 1)
    }
    return responseContent ?? []
  }, [activeResponse?.prompt.content, isPromptsLoading, suggestions])

  return (
    <Flex direction="column" w="full" ref={activeResponseRef}>
      <AnimatePresence>
        {activeResponse && (
          <Flex direction="column" w="full" gap={2}>
            {responseContent.map((prompt, i) => (
              <PromptLabel
                key={i}
                data-testid={`compose-active-prompt-${i}`}
                layoutId={hasPreviousSuggestions ? prompt : undefined}
                layout={false}
                transition={kOptionSlideInTransition(i)}
                initial={{
                  opacity: hasPreviousSuggestions ? 1 : 0,
                  x: -50,
                }}
                animate={{ opacity: suggestions ? 0.2 : 1, x: 0 }}
                // This prevents the label from animating on exit
                exit={{ opacity: 0, transition: { type: false } }}
                onClick={restorePreviousSuggestions}
                cursor={hasPreviousSuggestions ? 'pointer' : 'text'}
              >
                {prompt}
              </PromptLabel>
            ))}
          </Flex>
        )}
      </AnimatePresence>
      {isPromptsLoading && (
        <Flex px={4} mt={6}>
          <Box
            className="dot-flashing-animation"
            data-testid="dot-flashing-animation"
          ></Box>
        </Flex>
      )}
      {Boolean(suggestions) && <ComposeSuggestions />}
      <Box opacity={!hideResponseInput ? 1 : 0} mt={2}>
        {/* Below we are keeping textarea mounted to help with maintaining focus between questions */}
        <Box
          position={hideTextArea ? 'fixed' : 'static'}
          top={hideTextArea ? -9999 : undefined}
        >
          <ResponseTextarea />
        </Box>

        {activeResponse &&
          ['multi-select', 'select'].includes(activeResponse.prompt.input) && (
            <Box mt={2}>
              <ResponseInputSelect response={activeResponse} />
            </Box>
          )}

        {/* TODO: add this back and fix the ffmpeg pkg import */}
        {/* {!isStreaming &&
          activeResponse?.prompt.input === 'text' &&
          !mustFinish && <ResponseActionBar />} */}

        {/* Unmount when loading so the buttons instantly disappear instead of fading out between prompts */}
        {!isLoading && !isStreaming && (canContinue || canSave) && (
          <>
            <Divider mt={6} />
            <Flex h="40px" mt={6} w="full" justify="space-between" gap={2}>
              <ButtonGroup justifyContent="space-between" w="full">
                {!premiumDigDeeperLimitReached &&
                  !mustFinish &&
                  !(
                    promptMode === 'freeform' &&
                    composeTemplate.settings?.disableDigDeeper
                  ) && (
                    <CoachMark
                      flag={UserFlag.digDeeperTipSeen}
                      isDisabled={
                        promptMode !== 'freeform' ||
                        activeResponse?.response?.[0]?.length === 0 ||
                        composeTemplate.settings?.disableCoachMarks
                      }
                    >
                      <Button
                        data-testid="compose-response-submit"
                        flex={{ base: 0, md: 1 }}
                        variant="primary"
                        fontSize="14px"
                        onClick={handleSubmitResponse}
                        pr={6}
                        minW={{ base: '48%', md: '200px' }}
                        maxW="216px"
                        isDisabled={!canContinue || isSaving}
                        pl={promptMode !== 'freeform' ? 6 : undefined}
                        leftIcon={
                          promptMode === 'freeform' ? (
                            <RbGoDeeper boxSize="18px" />
                          ) : undefined
                        }
                      >
                        {buttonLabel}
                      </Button>
                    </CoachMark>
                  )}
                {!isStreaming && canSave && (
                  <CoachMark
                    flag={UserFlag.finishEntryTipSeen}
                    prerequisites={[UserFlag.digDeeperTipSeen]}
                    isDisabled={composeTemplate.settings?.disableCoachMarks}
                  >
                    <Button
                      data-testid="finish-entry-button"
                      flex={{ base: 0, md: 1 }}
                      variant="outline"
                      fontSize="14px"
                      maxW="216px"
                      minW={{ base: '48%', md: '200px' }}
                      pr={6}
                      leftIcon={
                        hideIcon ? undefined : <RbCheckmark boxSize="18px" />
                      }
                      onClick={() => saveEntry('actionBar')}
                      isLoading={isSaving}
                      isDisabled={!canSave}
                      {...finishButtonProps}
                    >
                      {composeTemplate.finishButtonLabel ?? 'Finish entry'}
                    </Button>
                  </CoachMark>
                )}
              </ButtonGroup>
            </Flex>
          </>
        )}
      </Box>
    </Flex>
  )
}

export default ComposeResponseInput
