import { Box, Flex } from '@chakra-ui/react'
import { useModalProvider } from 'providers/ModalProvider'
import { IoGiftOutline } from 'react-icons/io5'
import { kMobileIconSize } from 'ui/constants'

const DesktopNavGiftButton = () => {
  const openModal = useModalProvider()
  return (
    <Flex
      color='iconColor'
      onClick={() => openModal('referral')}
      cursor='pointer'
      w='32px' // To match the width of the title menu
      justifyContent='center'
    >
      <Box
        as={IoGiftOutline}
        h={{ base: kMobileIconSize, md: 18 }}
        w={{ base: kMobileIconSize, md: 18 }}
      />
    </Flex>
  )
}

export default DesktopNavGiftButton
