import { Flex, Text, useDisclosure, useTheme } from '@chakra-ui/react'
import { AnimatePresence } from 'framer-motion'
import moment from 'moment'
import { useRouter } from 'next/router'
import { useComposeProvider } from 'providers/ComposeProvider'
import { useMemo } from 'react'
import { BiChevronRight } from 'react-icons/bi'
import MotionBox from 'shared/ui/core/MotionBox'
import { useComposeCoordinator } from '../../ComposeCoordinator'
import ComposeSettingsModal from '../../ComposeSettingsModal'

const JournalModeToggle = () => {
  const router = useRouter()
  const { colors } = useTheme()
  const { composeTemplate, journalMode, isStreaming } = useComposeProvider()
  const { canToggleJournalMode } = useComposeCoordinator()

  const formattedDate = useMemo(
    () => moment(router.query?.day).format('MMM Do'),
    [router.query?.day]
  )

  /**
   * Visibility for compose mode
   */
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <AnimatePresence>
      {!composeTemplate.id.includes('onboarding') &&
        composeTemplate.finishMode !== 'auto' &&
        !composeTemplate.settings?.forceJournalMode &&
        canToggleJournalMode &&
        !isStreaming && (
          <MotionBox
            key='journal-mode-toggle'
            position={{ base: 'fixed', md: 'absolute' }}
            bottom={4}
            right={0}
            left={0}
            w='100%'
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
          >
            <Flex
              justify='space-between'
              mx='auto'
              px={6}
              align='center'
              gap={1}
              onClick={() => onOpen()}
              cursor='pointer'
            >
              <Text color='brandGray.500' fontSize='15px' textAlign='right'>
                {journalMode === 'interactive' ? 'Interactive' : 'Focused'}
              </Text>
              <Flex align='center' gap={1}>
                <Text color='brandGray.500' fontSize='15px' textAlign='right'>
                  {formattedDate}
                </Text>
                <BiChevronRight fill={colors.brandGray[500]} />
              </Flex>
            </Flex>
          </MotionBox>
        )}
      <ComposeSettingsModal
        isOpen={isOpen}
        onClose={onClose}
        journalMode={journalMode}
        onOpen={onOpen}
      />
    </AnimatePresence>
  )
}

export default JournalModeToggle
