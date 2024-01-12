import { useModalProvider } from 'providers/ModalProvider'
import { IoGiftOutline } from 'react-icons/io5'
import { kMobileIconSize } from 'shared/ui/constants'
import NavigationBarButton from '../NavigationBarButton'

const NavigationBarGiftButton = () => {
  const openModal = useModalProvider()

  return (
    <NavigationBarButton
      icon={<IoGiftOutline size={kMobileIconSize} />}
      onClick={() => openModal('referral')}
      aria-label='Refer a friend'
    />
  )
}

export default NavigationBarGiftButton
