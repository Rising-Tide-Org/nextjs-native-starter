import Analytics from 'lib/analytics'
import { registerDevice, unregisterDevice } from 'net/onesignal/device'
import { useUserProvider } from 'providers/UserProvider'
import { useCallback, useState, useMemo, useEffect, useRef } from 'react'
import OneSignal from 'react-onesignal'

/**
 * useNotificationManager
 * ---------------------
 * This hook is responsible for managing the user's SMS and Push notification settings
 * and syncing them between the browser and the provider (in this case, OneSignal)
 *
 * It also listens for changes in OneSignal's permission and subscription
 * and updates the user's settings accordingly
 */

type NotificationManagerReturnType = {
  togglePushNotifications: (enabled: boolean) => void
  toggleSmsNotifications: (enabled: boolean) => void
  toggleReminders: (enabled: boolean) => void
  syncUserToProvider: () => void
  isPushLoading: boolean
  isSMSLoading: boolean
}

type NotificationManagerProps = {
  onPermissionChange?: (
    permission: NotificationPermission,
    userId?: string | null
  ) => void
}

const useNotificationManager = (
  { onPermissionChange }: NotificationManagerProps = {
    onPermissionChange: () => null,
  }
): NotificationManagerReturnType => {
  const { user, updateUserFields } = useUserProvider()
  const [isPushLoading, setIsPushLoading] = useState(false)
  const [isSMSLoading, setIsSMSLoading] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  /**
   * Listen for changes in OneSignal's permission and subscription
   */
  useEffect(() => {
    // Important: Get initial permission state
    OneSignal.getNotificationPermission().then(async (permission) => {
      if (permission === 'granted') {
        OneSignal.getUserId().then(async (userId) => {
          onPermissionChange?.(permission, userId)
        })
      } else {
        onPermissionChange?.(permission)
      }
    })

    // Listen for changes in permissions.
    // Note: On iOS, the OneSignal user is not available yet
    const handleNotificationPermissionChange = (permission: any) => {
      OneSignal.getUserId().then((userId) => {
        if (userId && permission.to === 'granted') {
          registerDevice({ deviceType: 'push', deviceId: userId })
          onPermissionChange?.(permission.to, userId)
        } else {
          onPermissionChange?.(permission.to)
        }
      })
    }

    // Listen for changes in subscription
    // Note: On iOS, the OneSignal user is not available
    const handleSubscriptionChange = (isSubscribed: any) => {
      OneSignal?.getNotificationPermission()?.then(async (permission) => {
        if (permission === 'granted') {
          OneSignal.getUserId().then(async (userId) => {
            if (userId && isSubscribed) {
              await registerDevice({ deviceType: 'push', deviceId: userId })
              onPermissionChange?.(permission, userId)
            }
            setIsPushLoading(false)
          })
        }
      })
    }

    OneSignal.on(
      'notificationPermissionChange',
      handleNotificationPermissionChange
    )
    OneSignal.on('subscriptionChange', handleSubscriptionChange)

    return () => {
      OneSignal.off(
        'notificationPermissionChange',
        handleNotificationPermissionChange
      )
      OneSignal.off('subscriptionChange', handleSubscriptionChange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Toggle push notifications on or off
   * Interacts with the registerDevice and unregisterDevice endpoints
   */
  const togglePushNotifications = useCallback(
    async (enabled: boolean) => {
      Analytics.trackEvent('settings.reminders.push.toggle', { enabled })

      if (enabled) {
        setIsPushLoading(true)
        const permission = await OneSignal?.getNotificationPermission()
        if (permission === 'default') {
          await OneSignal.registerForPushNotifications()

          intervalRef.current = setInterval(async () => {
            const permission = await OneSignal?.getNotificationPermission()
            if (permission === 'granted') {
              const userId = await OneSignal.getUserId()
              if (userId) {
                clearInterval(intervalRef.current!)
                onPermissionChange?.(permission, userId)
                await registerDevice({ deviceType: 'push', deviceId: userId })
                setIsPushLoading(false)
              }
            }
          }, 250)
        } else if (permission === 'granted') {
          const userId = await OneSignal.getUserId()
          if (userId) {
            onPermissionChange?.(permission, userId)
            await registerDevice({ deviceType: 'push', deviceId: userId })
          }
          setIsPushLoading(false)
        } else {
          setIsPushLoading(false)
        }
      } else {
        // Unregister device from OneSignal
        OneSignal.getUserId().then(async (userId) => {
          if (userId) {
            unregisterDevice('push', userId)
          }
        })
      }
    },
    [onPermissionChange]
  )

  /**
   * Toggle SMS notifications on or off
   */
  const toggleSmsNotifications = useCallback(
    async (enabled: boolean) => {
      Analytics.trackEvent('settings.reminders.sms.toggle', { enabled })
      setIsSMSLoading(true)
      if (enabled) {
        // Register device on OneSignal
        await registerDevice({ deviceType: 'sms' })
      } else if (user.phone) {
        {
          // Unregister device from OneSignal
          await unregisterDevice('sms', user.phone)
        }
        setIsSMSLoading(false)
      }
    },
    [user.phone]
  )

  /**
   * Toggle reminders on or off entirely
   */
  const toggleReminders = useCallback(
    async (enabled: boolean) => {
      Analytics.trackEvent('settings.reminders.toggle', {
        enabled,
      })

      await updateUserFields({ 'notifications.enabled': enabled })

      // If we're enabling reminders, we should only toggle the user's
      // preferred channel.
      if (enabled) {
        if (user.notifications?.channel === 'push') {
          togglePushNotifications(enabled)
        } else if (
          user.notifications?.channel === 'sms' ||
          user.phoneVerified
        ) {
          toggleSmsNotifications(enabled)
        }
      } else {
        // If we're disabling reminders, we should disable both channels
        await togglePushNotifications(enabled)
        await toggleSmsNotifications(enabled)
      }
    },
    [
      togglePushNotifications,
      toggleSmsNotifications,
      updateUserFields,
      user.notifications?.channel,
      user.phoneVerified,
    ]
  )

  /**
   * Sync user to notification provider (in this case, OneSignal)
   */
  const syncUserToProvider = useCallback(async () => {
    OneSignal.getUserId().then((userId) => {
      if (userId) {
        registerDevice({
          deviceType: 'push',
          deviceId: userId,
          updateOnly: true,
        })
      }
    })
    if (user.phone && user.phoneVerified) {
      registerDevice({ deviceType: 'sms', updateOnly: true })
    }
  }, [user.phone, user.phoneVerified])

  const result = useMemo(() => {
    return {
      togglePushNotifications,
      toggleSmsNotifications,
      toggleReminders,
      syncUserToProvider,
      isPushLoading,
      isSMSLoading,
    }
  }, [
    togglePushNotifications,
    toggleSmsNotifications,
    toggleReminders,
    syncUserToProvider,
    isPushLoading,
    isSMSLoading,
  ])

  return result
}

export default useNotificationManager
