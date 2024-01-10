import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useTheme,
  Box,
  ModalProps,
} from '@chakra-ui/react'

import TopBar from 'ui/global/TopBar'
import { kVersionsWithReleaseNotes } from 'constants/releaseNotes'
import { useCallback, useEffect, useState } from 'react'
import { useUserProvider } from 'providers/UserProvider'
import Markdown from 'ui/shared/Markdown'

type Props = Pick<ModalProps, 'isOpen' | 'onClose'>

const latestVersion = kVersionsWithReleaseNotes[0]

const WhatsNewModal = ({ isOpen, onClose }: Props) => {
  const { zIndices } = useTheme()
  const { updateUserFields } = useUserProvider()
  const [releaseNotes, setReleaseNotes] = useState<string | null>(null)

  /**
   * Load release notes for latest version on mount from `constants/releaseNotes`
   */
  useEffect(() => {
    try {
      import(`constants/releaseNotes/${latestVersion}.md`).then((content) => {
        setReleaseNotes(content.default)
      })
    } catch (e) {
      console.error(e)
      handleClose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * On close, update user metadata to indicate that the user has seen the latest release notes
   */
  const handleClose = useCallback(() => {
    updateUserFields({ 'metadata.lastSeenReleaseNotes': latestVersion }).then(
      () => {
        onClose()
      }
    )
  }, [onClose, updateUserFields])

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      preserveScrollBarGap
      closeOnOverlayClick={false}
      motionPreset='slideInBottom'
      autoFocus={true}
      size={{ base: 'full', md: 'md' }}
    >
      <ModalOverlay />
      <ModalContent rounded='md' overflow='hidden'>
        <ModalCloseButton
          zIndex={zIndices.sticky}
          data-testid='new-features-close-btn'
        />
        <ModalBody p={0}>
          <TopBar
            hideBackButton={true}
            title={`✨ What's New in v${latestVersion}`}
          />
          <Box p={6}>
            <Markdown
              content={releaseNotes ?? ''}
              onButtonClick={handleClose}
            />
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default WhatsNewModal
