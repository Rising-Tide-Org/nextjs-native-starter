import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  IconButton,
  Link,
} from '@chakra-ui/react'
import { CgMenu } from 'react-icons/cg'
import {
  HiOutlineChatBubbleOvalLeftEllipsis,
  HiOutlineCog6Tooth,
} from 'react-icons/hi2'
import FeedbackModal from 'ui/shared/modals/FeedbackModal'
import SubscriptionMenuItem from './SubscriptionMenuItem'
import { isMobileDevice, isPWAInstalled } from 'util/device'
import { MdOutlineInstallMobile, MdOutlineInstallDesktop } from 'react-icons/md'
import { IoHelpBuoyOutline } from 'react-icons/io5'
import InstallAppModal from 'ui/shared/modals/InstallAppModal'
import { useState } from 'react'
import ReferralsMenuItem from './ReferralsMenuItem'
import NextLink from 'next/link'
import navigator from 'lib/routes'
import Analytics from 'lib/analytics'
import { kMobileIconSize } from 'shared/ui/constants'
import useIsMobile from 'shared/hooks/useIsMobile'

const NavHamburgerMenu = () => {
  const [showInstall, setShowInstall] = useState(false)
  const isMobile = useIsMobile()

  const {
    isOpen: isFeedbackOpen,
    onOpen: onFeedbackOpen,
    onClose: onFeedbackClose,
  } = useDisclosure()

  return (
    <>
      <Menu placement='bottom-end' variant='title'>
        <MenuButton data-testid='settings-menu-icon'>
          <IconButton
            as='div'
            icon={<CgMenu size={isMobile ? kMobileIconSize : '20px'} />}
            variant='ghost'
            size='sm'
            aria-label='Menu'
          />
        </MenuButton>
        <MenuList>
          <SubscriptionMenuItem />
          <MenuDivider />

          {!isMobile && (
            <>
              <MenuItem
                as={NextLink}
                href={navigator.settings}
                passHref
                shallow
                data-testid='settings-menu-item-settings'
                icon={<HiOutlineCog6Tooth size='22px' />}
              >
                Settings
              </MenuItem>
              <MenuDivider />
            </>
          )}

          <MenuItem
            data-testid='settings-menu-item-feedback'
            icon={<HiOutlineChatBubbleOvalLeftEllipsis size='22px' />}
            onClick={onFeedbackOpen}
          >
            Send feedback
          </MenuItem>

          <ReferralsMenuItem />

          <Link
            href='https://help.rosebud.app'
            isExternal
            onClick={() => Analytics.trackEvent('menu.help')}
            _hover={{ textDecoration: 'none' }}
          >
            <MenuItem icon={<IoHelpBuoyOutline size='22px' />}>Help</MenuItem>
          </Link>

          {!isPWAInstalled() && (
            <>
              <MenuDivider />
              <MenuItem
                icon={
                  isMobileDevice() ? (
                    <MdOutlineInstallMobile size='22px' />
                  ) : (
                    <MdOutlineInstallDesktop size='22px' />
                  )
                }
                onClick={() => setShowInstall(true)}
              >
                Install app
              </MenuItem>
            </>
          )}
        </MenuList>
      </Menu>
      <FeedbackModal isOpen={isFeedbackOpen} onClose={onFeedbackClose} />
      {showInstall && <InstallAppModal onClose={() => setShowInstall(false)} />}
    </>
  )
}

export default NavHamburgerMenu
