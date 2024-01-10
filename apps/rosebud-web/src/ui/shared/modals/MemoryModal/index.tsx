import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  useTheme,
  VStack,
} from '@chakra-ui/react'
import { Analytics } from 'lib/analytics'
import { useUserProvider } from 'providers/UserProvider'
import { useCallback, useEffect } from 'react'
import EmptyPageState from 'ui/core/EmptyPageState'
import MemorySettings from 'ui/pages/settings/MemorySettings'
import { Experimentation } from 'ui/shared/Illustration'

type Props = {
  isOpen?: boolean
  onClose?: () => void
}

const MemoryModal = ({ isOpen = true, onClose }: Props) => {
  const { zIndices } = useTheme()
  const { user } = useUserProvider()

  // Track the view event when the modal is shown
  useEffect(() => {
    Analytics.trackEvent('memory.modal.view')
  }, [])

  const handleClose = useCallback(async () => {
    Analytics.trackEvent('memory.modal.close')
    onClose?.()
  }, [onClose])

  useEffect(() => {
    if (user.settings.memoryEnabled && user.metadata?.backfilledVectors) {
      handleClose()
    }
  }, [
    handleClose,
    user.metadata?.backfilledVectors,
    user.settings.memoryEnabled,
  ])

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      preserveScrollBarGap
      closeOnOverlayClick={false}
      motionPreset='slideInBottom'
      autoFocus={true}
      size='md'
    >
      <ModalOverlay />
      <ModalContent rounded='md' overflow='hidden' mx={{ base: 4, md: 0 }}>
        <ModalCloseButton
          zIndex={zIndices.sticky}
          data-testid='push-notif-close-btn'
        />
        <ModalBody p={0}>
          <EmptyPageState
            header='Turn on memory'
            icon={
              <Experimentation
                className='image'
                objectFit='contain'
                h={{ base: '120px', md: '120px' }}
                w={{ base: '120px', md: '120px' }}
                right={4}
                top={4}
              />
            }
            afterElement={
              <VStack px={6} gap={2}>
                <MemorySettings
                  description='Memory must be enabled to use this feature.'
                  justifyContent='center'
                  align='center'
                  textAlign='center'
                  color='brandGray.500'
                  gap={8}
                />
              </VStack>
            }
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default MemoryModal
