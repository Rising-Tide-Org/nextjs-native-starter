import { useDisclosure } from '@chakra-ui/react'
import { useEffect } from 'react'
import NotificationPromoModal, { NotificationPromoModalProps } from './index'

// A simple wrapper component for NotificationPromo modal to auto open it
const NotificationPromoAutoModal = (
  props: Omit<NotificationPromoModalProps, 'isOpen' | 'onClose'>
) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    onOpen()
  }, [onOpen])

  return <NotificationPromoModal isOpen={isOpen} onClose={onClose} {...props} />
}

export default NotificationPromoAutoModal
