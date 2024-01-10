import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  ModalProps,
  useTheme,
  Image,
  Button,
  useToast,
  VStack,
} from '@chakra-ui/react'

import { ChangeEvent, useCallback, useRef, useState } from 'react'
import { useUserProvider } from 'providers/UserProvider'
import { UserFlag } from 'types/User'
import EmptyPageState from 'ui/core/EmptyPageState'
import MakeToast from 'ui/core/MakeToast'
import LocalTimeSelector from 'ui/shared/LocalTimeSelector'
import { kDefaultReminderTime } from 'constants/defaults'
import useNotificationManager from 'hooks/useNotificationManager'
import Analytics from 'lib/analytics'

type Props = Pick<ModalProps, 'isOpen' | 'onClose'>

const PushNotificationModal = ({ isOpen, onClose }: Props) => {
  const { zIndices } = useTheme()
  const { setUserFlag, user } = useUserProvider()
  const [timeValue, setTimeValue] = useState<number>(
    user.reminder_hour_local ?? kDefaultReminderTime
  )
  const toast = useToast()
  const { togglePushNotifications, isPushLoading } = useNotificationManager({
    onPermissionChange(permission, userId) {
      if (permission === 'granted' && userId) {
        onNotificationsEnabled()
      }
    },
  })
  const enabledRef = useRef(false)

  /**
   * On close, update user metadata to indicate that the user has seen the latest release notes
   */
  const handleClose = useCallback(async () => {
    await setUserFlag(UserFlag.pushNotificationsDismissed, true)
    onClose()
  }, [onClose, setUserFlag])

  const handleEnableNotifications = useCallback(() => {
    Analytics.trackEvent('modal.pushNotifications.enable')
    togglePushNotifications(true)
  }, [togglePushNotifications])

  /**
   * When notifications are enabled, close the modal and show a toast
   */
  const onNotificationsEnabled = useCallback(() => {
    if (enabledRef.current) return

    Analytics.trackEvent('modal.pushNotifications.enable.success')

    enabledRef.current = true
    toast(
      MakeToast({
        title: 'Push notifications enabled',
      })
    )
    handleClose()
  }, [handleClose, toast])

  const onChangeTime = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setTimeValue(parseInt(e.target.value))
    },
    [setTimeValue]
  )

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
            header={
              user.phoneVerified
                ? 'Upgrade your reminders'
                : 'Enable daily reminders'
            }
            label={`Get native push notifications directly to this device${
              user.phoneVerified ? ' instead of SMS' : ''
            }.`}
            icon={
              <Image
                src='/images/doodles/bell.svg'
                w='108px'
                alt='Notification bell on wheels'
              />
            }
            afterElement={
              <VStack px={6} gap={2}>
                <LocalTimeSelector
                  prefix='Daily at '
                  minW='100%'
                  size='lg'
                  value={timeValue}
                  onChange={onChangeTime}
                />
                <Button
                  variant='primary'
                  size='lg'
                  isLoading={isPushLoading}
                  onClick={handleEnableNotifications}
                >
                  Enable push notifications
                </Button>
                <Button
                  variant='ghost'
                  onClick={handleClose}
                  fontWeight={450}
                  color='brandGray.500'
                >
                  Maybe later
                </Button>
              </VStack>
            }
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default PushNotificationModal
