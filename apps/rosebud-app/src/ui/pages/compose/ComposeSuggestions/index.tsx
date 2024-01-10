import { Flex, Button, Text } from '@chakra-ui/react'
import { AnimatePresence } from 'framer-motion'
import { useComposeProvider } from 'providers/ComposeProvider'
import { useUserProvider } from 'providers/UserProvider'
import { useCallback, useMemo } from 'react'
import MotionBox from 'ui/core/MotionBox'
import { RbRegenerate } from 'ui/shared/Icon'
import { isMobileDevice } from 'util/device'
import { useComposeCoordinator } from '../ComposeCoordinator'
import PromptSuggestions from './PromptSuggestions'

const ComposeSuggestions = () => {
  const { user } = useUserProvider()
  const {
    suggestions,
    isStreaming,
    generatePrompts,
    selectPrompt,
    clearSuggestions,
  } = useComposeProvider()
  const { textAreaRef, inputOptionsRef, moveCursorToEnd } =
    useComposeCoordinator()

  /**
   * Select a prompt from the generated prompt options
   */
  const handleSelectPrompt = useCallback(
    (prompt: string) => {
      if (!isMobileDevice()) {
        textAreaRef.current?.focus()
      }
      selectPrompt(prompt)
    },
    [selectPrompt, textAreaRef]
  )

  /**
   * Regenerate the suggestions based on type
   */
  const handleRegenerate = useCallback(() => {
    switch (suggestions?.type) {
      case 'prompts':
        generatePrompts(undefined, true)
        break
    }
  }, [generatePrompts, suggestions?.type])

  /**
   * Cancel the suggestions
   */
  const handleCancel = useCallback(() => {
    clearSuggestions()
    if (!isMobileDevice()) {
      moveCursorToEnd()
    }
  }, [clearSuggestions, moveCursorToEnd])

  /**
   * Define the label based on the type of suggestions
   */
  const label = useMemo(
    () =>
      user?.settings.journalMode === 'interactive'
        ? 'Choose a different question to explore:'
        : 'Choose a question to explore:',
    [user?.settings.journalMode]
  )

  return (
    <Flex direction='column' w='full' gap={2} ref={inputOptionsRef} mt={4}>
      <AnimatePresence>
        <MotionBox
          key='label'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.5,
          }}
        >
          <Text fontSize='md' color='brandGray.500'>
            {label}
          </Text>
        </MotionBox>
        {suggestions?.type === 'prompts' && (
          <PromptSuggestions
            suggestions={suggestions}
            onSelect={handleSelectPrompt}
          />
        )}
        {!isStreaming && (
          <MotionBox
            mt={4}
            key='button'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Flex w={{ base: 'full', md: 'auto' }} gap={2}>
              <Button
                w={{ base: '50%', md: 'auto' }}
                variant='outline'
                fontSize='14px'
                px={6}
                onClick={handleRegenerate}
                leftIcon={<RbRegenerate boxSize='16px' />}
              >
                Regenerate
              </Button>

              <Button
                variant='outline'
                fontSize='14px'
                w={{ base: '50%', md: 'auto' }}
                px={6}
                ml={2}
                onClick={handleCancel}
              >
                Back to writing
              </Button>
            </Flex>
          </MotionBox>
        )}
      </AnimatePresence>
    </Flex>
  )
}

export default ComposeSuggestions
