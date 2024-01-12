import {
  VStack,
  Text,
  useToast,
  useDisclosure,
  Flex,
  Switch,
  Link,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  TabPanels,
  Button,
} from '@chakra-ui/react'
import Analytics from 'lib/analytics'
import { useUserProvider } from 'providers/UserProvider'
import { useCallback, memo, useMemo, ChangeEvent, useState } from 'react'
import { captureException } from '@sentry/nextjs'
import LocalTimeSelector from 'ui/shared/LocalTimeSelector'
import { getNearestUTCHourFromLocal, hourAsLocalTimeString } from 'util/date'
import MakeToast from 'ui/core/MakeToast'
import NotificationPromoModal from 'ui/shared/modals/NotificationPromoModal'
import Section, { SectionBody } from '../Section'
import { RbNotifications } from 'ui/shared/Icon'
import { AsYouType } from 'libphonenumber-js'
import {
  isiOSWebPushSupported as getIsiOSWebPushSupported,
  isPWAInstalled,
} from 'util/device'
import { HiCheckCircle } from 'react-icons/hi2'
import { useModalProvider } from 'providers/ModalProvider'
import useNotificationManager from 'shared/hooks/useNotificationManager'
import {
  minimumIOSMajorVersion,
  minimumIOSMinorVersion,
} from 'constants/notifications'
import WarningCard from 'ui/shared/WarningCard'

const ReminderSettings = () => {
  const { user, updateUser } = useUserProvider()
  const {
    togglePushNotifications,
    toggleSmsNotifications,
    toggleReminders,
    syncUserToProvider,
    isPushLoading,
    isSMSLoading,
  } = useNotificationManager({
    onPermissionChange: (permission) => {
      setPushPermission(permission)
    },
  })
  const openModal = useModalProvider()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [pushPermission, setPushPermission] = useState<NotificationPermission>()

  const isiOSWebPushSupported = useMemo(() => getIsiOSWebPushSupported(), [])

  const onReminderUpdateOpen = useCallback(() => {
    Analytics.trackEvent('settings.reminders.updateTime.open')
    onOpen()
  }, [onOpen])

  const onSelect = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const hour = parseInt(e.target.value)

      Analytics.trackEvent('settings.reminders.updateTime', {
        reminderHour: hour,
      })

      updateUser({
        reminder_hour_local: hour,
        reminder_hour_utc: getNearestUTCHourFromLocal(hour),
      })
        .then(() => {
          syncUserToProvider()
          toast(
            MakeToast({
              title: 'Reminders set!',
              description: `You will receive a daily reminder at ${hourAsLocalTimeString(
                hour
              )}`,
            })
          )
        })
        .catch(captureException)
    },
    [updateUser, syncUserToProvider, toast]
  )

  const handleInstallApp = useCallback(() => {
    openModal('installApp')
  }, [openModal])

  const formattedPhone = useMemo(
    () =>
      user.phone ? new AsYouType('US').input(user.phone.replace('+1', '')) : '',
    [user.phone]
  )

  const notificationsEnabled = useMemo(
    () =>
      user.notifications?.enabled ||
      (!user.notifications && user.phoneVerified),
    [user.notifications, user.phoneVerified]
  )

  const preferredChannel = useMemo(() => {
    return user.notifications?.channel
  }, [user.notifications?.channel])

  const pushText = useMemo(() => {
    const numDevices = user.notifications?.player_ids?.length ?? 0
    if (pushPermission === 'granted') {
      return `Push notifications enabled on this device${
        numDevices > 1
          ? ' and ' +
            (numDevices - 1) +
            ' other device' +
            (numDevices > 2 ? 's' : '')
          : ''
      }.`
    } else if (numDevices) {
      return `Push notifications enabled on ${numDevices} other device${
        numDevices > 1 ? 's' : ''
      }.`
    }
  }, [pushPermission, user.notifications?.player_ids?.length])

  return (
    <Section
      title='Daily Reminder'
      icon={<RbNotifications boxSize='17px' />}
      rightElement={
        <Switch
          colorScheme='brand'
          isChecked={notificationsEnabled}
          onChange={(e) => toggleReminders(e.target.checked)}
        />
      }
      pb={!notificationsEnabled ? 5 : undefined}
    >
      {notificationsEnabled && (
        <SectionBody>
          <VStack w='100%'>
            <VStack w='100%' align='left' gap={3}>
              <LocalTimeSelector
                prefix='Daily at '
                value={user?.reminder_hour_local}
                onChange={onSelect}
              />
              <Tabs
                variant='toggle'
                defaultIndex={preferredChannel === 'push' ? 1 : 0}
              >
                <TabList>
                  <Tab gap={2}>
                    SMS{' '}
                    {preferredChannel === 'sms' && (
                      <HiCheckCircle size='18px' />
                    )}
                  </Tab>
                  <Tab gap={2}>
                    Push{' '}
                    {preferredChannel === 'push' && (
                      <HiCheckCircle size='18px' />
                    )}
                  </Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <VStack align='start' gap={2}>
                      {user.phoneVerified &&
                        (preferredChannel === 'sms' || !user.notifications) && (
                          <Flex
                            align='center'
                            gap={2}
                            justify='space-between'
                            w='full'
                          >
                            <Text>Sending to {formattedPhone}</Text>
                            <Link
                              variant='primary'
                              fontSize='15px'
                              onClick={onReminderUpdateOpen}
                            >
                              Update
                            </Link>
                          </Flex>
                        )}

                      {!user.phoneVerified && (
                        <Button
                          variant='primary'
                          onClick={onReminderUpdateOpen}
                        >
                          Activate SMS reminders
                        </Button>
                      )}

                      {preferredChannel === 'push' && user.phoneVerified && (
                        <Button
                          variant='primary'
                          onClick={() => {
                            togglePushNotifications(false)
                            toggleSmsNotifications(true)
                          }}
                          isLoading={isSMSLoading}
                        >
                          Switch to SMS reminders
                        </Button>
                      )}
                    </VStack>
                  </TabPanel>
                  <TabPanel>
                    <VStack align='start' gap={2}>
                      {isPWAInstalled() ? (
                        <>
                          {preferredChannel === 'push' && (
                            <>
                              <Text>{pushText}</Text>
                              {pushPermission === 'denied' && (
                                <Text>
                                  You have blocked push notifications on this
                                  device.
                                </Text>
                              )}
                            </>
                          )}

                          {!isiOSWebPushSupported ? (
                            <WarningCard>
                              Push notifications are supported on iOS{' '}
                              {minimumIOSMajorVersion}.{minimumIOSMinorVersion}{' '}
                              or above. Please update your iOS to use this
                              feature.
                            </WarningCard>
                          ) : null}

                          {(pushPermission === 'default' ||
                            preferredChannel !== 'push') && (
                            <Button
                              variant='primary'
                              onClick={() => {
                                togglePushNotifications(true)
                                toggleSmsNotifications(false)
                              }}
                              isLoading={isPushLoading}
                              isDisabled={!isiOSWebPushSupported}
                            >
                              Enable Push Notifications
                            </Button>
                          )}
                        </>
                      ) : (
                        <>
                          <Text>
                            Get push notifications directly to your device when
                            you install the app.
                          </Text>
                          <Button variant='primary' onClick={handleInstallApp}>
                            Install Rosebud app
                          </Button>
                        </>
                      )}
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </VStack>
            <NotificationPromoModal
              isOpen={isOpen}
              onClose={onClose}
              withFeedback={false}
              initialPhoneNumber={user.phone}
              source='settings'
            />
          </VStack>
        </SectionBody>
      )}
    </Section>
  )
}

export default memo(ReminderSettings)
