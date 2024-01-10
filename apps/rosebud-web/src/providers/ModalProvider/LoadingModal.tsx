import {
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Spinner,
  useDisclosure,
} from '@chakra-ui/react'
import { useEffect } from 'react'
import EmptyPageState from 'ui/core/EmptyPageState'

const LoadingModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    onOpen()
    return () => {
      onClose()
    }
  }, [isOpen, onOpen, onClose])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      motionPreset='none'
      scrollBehavior='inside'
      size={{ base: 'full', md: 'md' }}
    >
      <ModalOverlay />
      <ModalContent rounded='md' overflow='hidden'>
        <ModalBody p={0}>
          <EmptyPageState afterElement={<Spinner />} />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default LoadingModal
