import {
  Modal,
  ModalContent,
  ModalHeader,
  useToast,
  ModalOverlay,
  ModalCloseButton,
} from '@chakra-ui/react'
import Analytics from 'lib/analytics'
import { useUserProvider } from 'providers/UserProvider'
import { useCallback, useEffect, useMemo, useState } from 'react'
import CodeEntryStep from './CodeEntry'
import FeedbackEntry from './FeedbackEntry'
import PhoneEntryStep from './PhoneEntry'
import { captureException as sentryCaptureException } from '@sentry/nextjs'
import { UserFlag } from 'types/User'
import { kDefaultReminderTime } from 'constants/defaults'
import { getNearestUTCHourFromLocal, hourAsLocalTimeString } from 'util/date'
import MakeToast from 'ui/core/MakeToast'
import onboardingTemplate from 'templates/onboarding-v5'
import TopBar from 'ui/global/TopBar'
import useNotificationManager from 'shared/hooks/useNotificationManager'
import { stripEmojis } from 'util/string'

enum EntryStage {
  phone,
  code,
  feedback,
}

export type NotificationPromoModalProps = {
  isOpen: boolean
  onClose: () => void
  source: string
  withFeedback?: boolean
  onlyFeedback?: boolean
  headerText?: string
  initialPhoneNumber?: string
}

const NotificationPromoModal = ({
  isOpen,
  onClose,
  source,
  withFeedback = true,
  onlyFeedback = false,
  headerText = 'Get daily reminders',
  initialPhoneNumber,
}: NotificationPromoModalProps) => {
  const { user, updateUserFields, setUserFlag } = useUserProvider()
  const { toggleSmsNotifications } = useNotificationManager()
  const [phoneNumber, setPhoneNumber] = useState<string>(
    initialPhoneNumber || ''
  )
  const [reminderLocalHour, setReminderLocalHour] = useState(
    user.reminder_hour_local ?? kDefaultReminderTime
  )
  const [stage, setStage] = useState(
    onlyFeedback ? EntryStage.feedback : EntryStage.phone
  )
  const toast = useToast()

  const isUpdatingFlow = Boolean(initialPhoneNumber)

  /**
   * Set the default notification time to their onboarding preference
   * Note: This will need to be updated if we change onboarding options
   */
  useEffect(() => {
    // If they've already set a notification time, don't override it
    if (user.notifications?.channel) {
      return
    }
    const options = (
      onboardingTemplate.prompts.find((p) => p.id === 'daytime')
        ?.options as string[]
    ).map((o) => stripEmojis(o))

    if (user?.onboarding?.daytime) {
      const selectedTime = stripEmojis(
        typeof user?.onboarding?.daytime === 'string'
          ? user?.onboarding?.daytime
          : user?.onboarding?.daytime[0]
      )

      if (selectedTime === options[0]) {
        // Morning
        setReminderLocalHour(9)
      } else if (selectedTime === options[1]) {
        // Afternoons
        setReminderLocalHour(14)
      } else if (selectedTime === options[2]) {
        // Evenings
        setReminderLocalHour(21)
      }
    } else {
      setReminderLocalHour(kDefaultReminderTime)
    }
  }, [user.onboarding, user.reminder_hour_local])

  /**
   * When the user dismisses the daily reminder modal.
   */
  const onDailyReminderDismiss = useCallback(() => {
    setUserFlag(UserFlag.notificationPromoDismissed, true)
      .catch((error) => {
        sentryCaptureException(error)
      })
      .finally(() => {
        onClose()
      })
  }, [onClose, setUserFlag])

  /**
   * When the user has successfully subscribed to daily reminders.
   */
  const onDailyReminderSubscribe = useCallback(
    async (phone: string) => {
      updateUserFields({
        phone,
        phoneVerified: true,
        reminder_hour_local: reminderLocalHour,
        reminder_hour_utc: getNearestUTCHourFromLocal(reminderLocalHour),
        'notifications.channel': 'sms',
        'notifications.enabled': true,
      })
        .then(() => {
          toggleSmsNotifications(true)
        })
        .catch((error) => {
          sentryCaptureException(error)
        })
        .finally(() => {
          if (withFeedback) {
            setStage(EntryStage.feedback)
          } else {
            setStage(EntryStage.phone)
            onClose()
          }
        })

      toast(
        MakeToast({
          title: 'Reminders set!',
          description: isUpdatingFlow
            ? null
            : `You will receive a daily reminder at ${hourAsLocalTimeString(
                reminderLocalHour
              )}`,
          status: 'success',
        })
      )
    },
    [
      updateUserFields,
      reminderLocalHour,
      toast,
      isUpdatingFlow,
      toggleSmsNotifications,
      withFeedback,
      onClose,
    ]
  )

  /**
   * When user manually closes the modal.
   */
  const handleDismiss = useCallback(() => {
    Analytics.trackEvent('notificationPromo.dismiss', {
      source,
      isUpdating: isUpdatingFlow,
    })
    onDailyReminderDismiss()
  }, [isUpdatingFlow, onDailyReminderDismiss, source])

  /**
   * When the phone is confirmed.
   */
  const onConfirmed = useCallback(() => {
    Analytics.trackEvent('notificationPromo.phoneVerified', {
      source,
      isUpdating: isUpdatingFlow,
    })
    onDailyReminderSubscribe(phoneNumber)
  }, [isUpdatingFlow, onDailyReminderSubscribe, phoneNumber, source])

  /**
   * Triggered after phone number is sent SMS verification
   */
  const onSent = useCallback(
    (value: string, localHour: number) => {
      Analytics.trackEvent('notificationPromo.phoneSubmitted', {
        reminderTime: localHour,
        source,
        isUpdating: isUpdatingFlow,
      })
      setPhoneNumber(value)
      setReminderLocalHour(localHour)
      setStage(EntryStage.code)
    },
    [isUpdatingFlow, source]
  )

  /**
   * If cancelled, we want to revert to the previous state.
   */
  const onCodeCancel = useCallback(() => {
    Analytics.trackEvent('notificationPromo.codeCancel', {
      source,
      isUpdating: isUpdatingFlow,
    })
    setStage(EntryStage.phone)
  }, [isUpdatingFlow, source])

  /**
   * Header text
   */
  const headerTextString = useMemo(() => {
    if (stage === EntryStage.phone) {
      return isUpdatingFlow ? 'Update phone number' : headerText
    } else if (stage === EntryStage.code) {
      return 'Enter code'
    } else if (stage === EntryStage.feedback) {
      return 'How was your first experience?'
    }
    return ''
  }, [headerText, isUpdatingFlow, stage])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      preserveScrollBarGap
      closeOnEsc={false}
      closeOnOverlayClick={false}
      motionPreset='slideInBottom'
      autoFocus={true}
      scrollBehavior='inside'
      size={{ base: 'full', md: 'md' }}
    >
      <ModalOverlay />
      <ModalContent rounded='md' overflow='hidden'>
        <ModalHeader alignItems='center' p={0}>
          <ModalCloseButton
            zIndex={1}
            top={3}
            onClick={handleDismiss}
            data-testid='notification-promo-close'
          />
          <TopBar title={headerTextString} hideBackButton />
        </ModalHeader>

        {stage === EntryStage.phone && (
          <PhoneEntryStep
            value={phoneNumber}
            onSent={onSent}
            reminderTime={reminderLocalHour}
            isUpdatingFlow={isUpdatingFlow}
          />
        )}
        {stage === EntryStage.code && (
          <CodeEntryStep
            onSuccess={onConfirmed}
            onCancel={onCodeCancel}
            phoneNumber={phoneNumber}
          />
        )}
        {stage === EntryStage.feedback && (
          <FeedbackEntry onClose={onDailyReminderDismiss} firstTime />
        )}
      </ModalContent>
    </Modal>
  )
}

export default NotificationPromoModal
