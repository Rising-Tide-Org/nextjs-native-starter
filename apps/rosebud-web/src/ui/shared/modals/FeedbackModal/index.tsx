import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
} from '@chakra-ui/react'
import { HiOutlineChatBubbleOvalLeftEllipsis } from 'react-icons/hi2'
import TopBar from 'ui/global/TopBar'
import FeedbackEntry from '../NotificationPromoModal/FeedbackEntry'

type Props = {
  isOpen: boolean
  onClose: () => void
}

const FeedbackModal = ({ isOpen, onClose }: Props) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    preserveScrollBarGap
    closeOnOverlayClick={false}
    motionPreset='slideInBottom'
    autoFocus={true}
    scrollBehavior='inside'
    size={{ base: 'full', md: 'md' }}
  >
    <ModalOverlay />
    <ModalContent>
      <ModalHeader p={0} rounded='md' overflow='hidden'>
        <TopBar
          title='Send feedback'
          hideBackButton
          icon={<HiOutlineChatBubbleOvalLeftEllipsis />}
        />

        <ModalCloseButton data-testid='feedback-modal-close-btn' />
      </ModalHeader>
      <FeedbackEntry onClose={onClose} />
    </ModalContent>
  </Modal>
)

export default FeedbackModal
