import {
  VStack,
  Button,
  Box,
  Text,
  Link,
  useColorModeValue,
} from '@chakra-ui/react'
import { Analytics } from 'lib/analytics'
import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'
import { RbEllipseVertical, SfShare } from 'ui/shared/Icon'
import { isMobileDevice, isPWAInstalled } from 'util/device'
import DrawerOrModal from '../DrawerOrModal'
import useLocalStorage from 'hooks/useLocalStorage'
import { kLSAppPrefix } from 'constants/localStorage'
import { useUserProvider } from 'providers/UserProvider'
import { UserFlag } from 'types/User'
import TopBar from 'ui/global/TopBar'
import { installEvent } from 'ui/global/AppInit'
import { MdOutlineInstallMobile, MdOutlineInstallDesktop } from 'react-icons/md'

type Props = {
  isOpen?: boolean
  onClose?: () => void
}

const InstallAppModal = ({ isOpen = true, onClose }: Props) => {
  const { setUserFlag, user } = useUserProvider()
  const guideBgColor = useColorModeValue('brandGray.100', 'gray.800')

  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [_, setLastReminder] = useLocalStorage<number>(
    `${kLSAppPrefix}/install/lastReminder`,
    0
  )

  const isTouchDevice = isMobileDevice()
  const isAndroid = /Android/i.test(navigator.userAgent)
  const isWindows = /Windows/i.test(navigator.userAgent)
  const isSafari = /Safari/i.test(navigator.userAgent) && !isAndroid
  const isMobileSafari = isTouchDevice && isSafari

  /**
   * Track the view event only when the modal is shown
   */
  useEffect(() => {
    if (showInstallPrompt && !isInstalled) {
      Analytics.trackEvent('app.install.prompt.view')
    }
  }, [showInstallPrompt, isInstalled])

  /**
   * Determine whether we should show the install prompt
   */
  useEffect(() => {
    // Detect if the app is installed already
    if (isPWAInstalled()) {
      setUserFlag(UserFlag.appInstallPromptDismissed, true)
      setIsInstalled(true)
    } else {
      setShowInstallPrompt(true)
    }
    // Only needs to pop up once, so deps don't matter
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Show the install prompt (Android / Chrome / Opera / Edge only)
   */
  const handleInstall = () => {
    if (installEvent) {
      installEvent.prompt()
      installEvent.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          Analytics.trackEvent('app.install.prompt.success')
          setShowInstallPrompt(false)
        } else {
          Analytics.trackEvent('app.install.prompt.dismiss')
        }
      })
    }
  }

  /**
   * Allow the user to be reminded later
   */
  const handleRemindMe = () => {
    Analytics.trackEvent('app.install.prompt.remind')
    setShowInstallPrompt(false)
    setLastReminder(Date.now())
  }

  /**
   * Dismiss the install prompt
   */
  const handleClose = useCallback(() => {
    setUserFlag(UserFlag.appInstallPromptDismissed, true)
    setShowInstallPrompt(false)
    onClose?.()
  }, [onClose, setUserFlag])

  const destinationString = isMobileDevice()
    ? 'Home Screen'
    : isWindows
    ? 'Task Bar'
    : 'Dock'

  const borderRadius = isAndroid ? 'md' : '18px'
  const actionIcon: React.ReactNode = isMobileSafari ? (
    <SfShare color='blue.500' />
  ) : (
    <RbEllipseVertical color='blue.500' boxSize='16px' />
  )
  const actionText = isMobileSafari ? 'Add to Home Screen' : 'Install'
  const triggerText = isTouchDevice ? 'Tap' : 'Click'

  if (isInstalled || !showInstallPrompt) return null

  return (
    <>
      {
        <DrawerOrModal
          isOpen={isOpen}
          onClose={handleClose}
          onOpen={() => null}
          closeOnEsc={false}
          closeOnOverlayClick={false}
          closeButtonTestId='install-app-modal-close'
        >
          <TopBar
            title='Install Rosebud'
            icon={
              isMobileDevice() ? (
                <MdOutlineInstallMobile size='22px' />
              ) : (
                <MdOutlineInstallDesktop size='22px' />
              )
            }
            hideBackButton
          />
          <VStack p={4} mt={8} mb={4} spacing={6}>
            <Box rounded={borderRadius} overflow='hidden'>
              <Image
                alt='Rosebud logo'
                src='/android-chrome-192x192.png'
                width={64}
                height={64}
              />
            </Box>
            <Text align='center' fontSize='lg' maxW='300px'>
              Boost your journaling consistency by up to 36% by installing
              Rosebud.
            </Text>
            <VStack spacing={5}>
              {installEvent ? (
                <Button
                  onClick={handleInstall}
                  variant='primary'
                  size='md'
                  minW='160px'
                >
                  Add to {destinationString}
                </Button>
              ) : (
                <VStack
                  bg={guideBgColor}
                  p={4}
                  rounded='md'
                  border='1px solid'
                  borderColor='inherit'
                >
                  <Text align='center'>
                    {triggerText} your browser's {actionIcon}{' '}
                    {!isMobileSafari ? 'menu' : ''} icon and select "
                    {actionText}"
                  </Text>
                </VStack>
              )}
              {!user.flags?.[UserFlag.appInstallPromptDismissed] ? (
                <Link color='brandGray.500' onClick={handleRemindMe}>
                  Remind me later
                </Link>
              ) : installEvent ? null : (
                <Text fontSize='sm' variant='tertiary'>
                  Note: Some browsers may not support this
                </Text>
              )}
            </VStack>
          </VStack>
        </DrawerOrModal>
      }
    </>
  )
}

export default InstallAppModal
