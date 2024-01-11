import { Flex, MenuItem } from '@chakra-ui/react'
import { useModalProvider } from 'providers/ModalProvider'
import { IoGiftOutline } from 'react-icons/io5'

const ReferralsMenuItem = () => {
  const openModal = useModalProvider()

  return (
    <>
      <MenuItem
        data-testid='settings-menu-item-referrals'
        icon={
          <Flex w='22px' h='22px' align='center' justify='center'>
            <IoGiftOutline size='20px' />
          </Flex>
        }
        onClick={() => openModal('referral')}
      >
        Refer friends
      </MenuItem>
    </>
  )
}

export default ReferralsMenuItem
