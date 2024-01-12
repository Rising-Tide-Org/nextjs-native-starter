import { kLSAppPrefix } from 'constants/localStorage'
import useLocalStorage from 'shared/hooks/useLocalStorage'
import moment from 'moment'
import { useEntryProvider } from 'providers/EntryProvider'
import { useModalProvider } from 'providers/ModalProvider'
import { useStreakProvider } from 'providers/StreakProvider'
import { useSubscriptionProvider } from 'providers/SubscriptionProvider'
import { useUserProvider } from 'providers/UserProvider'
import { useEffect, useMemo } from 'react'
import { UserFlag } from 'types/User'
import InstallAppModal from 'ui/shared/modals/InstallAppModal'
import NotificationPromoAutoModal from 'ui/shared/modals/NotificationPromoModal/NotificationPromoAutoModal'
import ProductSatisfactionSurveyModal from 'ui/shared/modals/ProductSatisfactionSurveyModal'
import SignUpModal from 'ui/shared/modals/SignUpModal'
import { isiOSWebPushSupported, isPWAInstalled } from 'util/device'

const OnboardingModals = () => {
  const { user } = useUserProvider()
  const openModal = useModalProvider()
  const { completions } = useStreakProvider()
  const { dailyEntryCreated } = useEntryProvider()
  const { openSubscribeModal, isSubscriptionActive } = useSubscriptionProvider()

  const [lastReminder] = useLocalStorage<number>(
    `${kLSAppPrefix}/install/lastReminder`,
    0
  )

  const firstEntry = useMemo(() => completions[0], [completions])

  /**
   * Show the subscribe modal
   */
  useEffect(() => {
    const lastReminder = Number(user.metadata?.lastUpgradeReminder) ?? 0

    // 1. Show the initial subscribe modal if the user has created a daily entry
    if (
      dailyEntryCreated &&
      user.flags?.[UserFlag.notificationPromoDismissed] &&
      user.flags?.[UserFlag.signUpCTADismissed] &&
      !user.flags?.[UserFlag.upgradePromoDismissed] &&
      !user.subscription?.id
    ) {
      openSubscribeModal('onboarding')
    } else if (
      // 2. Show the reminder if its been a week
      dailyEntryCreated &&
      user.flags?.[UserFlag.upgradePromoDismissed] &&
      !isSubscriptionActive &&
      (isNaN(lastReminder) || Date.now() - lastReminder > 86400000)
    ) {
      openSubscribeModal('reminder')
    } else if (
      isiOSWebPushSupported() &&
      isPWAInstalled() &&
      !user.flags?.[UserFlag.pushNotificationsDismissed] &&
      !user.notifications?.player_ids?.length
    ) {
      openModal('pushNotifications')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, dailyEntryCreated, isSubscriptionActive])

  // Logic to determine which modal to show
  // Only one at a time ever
  const modalToShow = useMemo(() => {
    if (!user.email) {
      return <SignUpModal />
    } else if (dailyEntryCreated) {
      if (!user.flags?.[UserFlag.notificationPromoDismissed]) {
        return (
          <NotificationPromoAutoModal
            headerText='🌹 Great start!'
            onlyFeedback={user?.phoneVerified}
            source='onboarding'
          />
        )
      } else if (completions.length >= 3) {
        const dayOfFirstEntry = moment(firstEntry?.day)
        // if user's been active for > 30 days, else at least 7 days...
        if (dayOfFirstEntry.isBefore(moment().subtract(30, 'days'))) {
          return <ProductSatisfactionSurveyModal daysSurveyedAfter={30} />
        } else if (dayOfFirstEntry.isBefore(moment().subtract(7, 'days'))) {
          return <ProductSatisfactionSurveyModal daysSurveyedAfter={7} />
        }
      }
    }

    // Show the install modal if the user has dismissed the upgrade promo
    // and has not dismissed the install modal. Once a week until dismissed.
    if (
      !user.flags?.[UserFlag.appInstallPromptDismissed] &&
      user.flags?.[UserFlag.upgradePromoDismissed] &&
      Date.now() - lastReminder > 604800000
    ) {
      return <InstallAppModal />
    }

    return null
  }, [
    dailyEntryCreated,
    user.flags,
    user.email,
    user?.phoneVerified,
    lastReminder,
    completions.length,
    firstEntry?.day,
  ])

  return <>{modalToShow}</>
}

export default OnboardingModals
