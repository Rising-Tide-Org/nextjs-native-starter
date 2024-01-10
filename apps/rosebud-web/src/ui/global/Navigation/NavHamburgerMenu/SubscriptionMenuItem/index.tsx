import { MenuItem } from '@chakra-ui/react'
import { AiOutlineCrown } from 'react-icons/ai'
import NextLink from 'next/link'
import { useSubscriptionProvider } from 'providers/SubscriptionProvider'
import navigator from 'lib/routes'
import { HiOutlineNewspaper } from 'react-icons/hi2'

const kDataTestId = 'settings-menu-item-subscriptions'

const SubscriptionMenuItem = () => {
  const { openSubscribeModal, isSubscriptionPresent, subscriptionTier } =
    useSubscriptionProvider()

  return (
    <>
      {subscriptionTier !== 'bloom' ? (
        <MenuItem
          data-testid={kDataTestId}
          icon={<AiOutlineCrown size='22px' />}
          onClick={() => openSubscribeModal('menu')}
        >
          Upgrade
        </MenuItem>
      ) : null}
      {isSubscriptionPresent ? (
        <MenuItem
          data-testid={kDataTestId}
          icon={<HiOutlineNewspaper size='22px' />}
          as={NextLink}
          href={navigator.subscription}
          passHref
          shallow
        >
          Subscription
        </MenuItem>
      ) : null}
    </>
  )
}

export default SubscriptionMenuItem
