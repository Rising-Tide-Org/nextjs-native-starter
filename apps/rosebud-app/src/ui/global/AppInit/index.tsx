import { Suspense, useEffect, useRef } from 'react'
import Analytics from 'lib/analytics'
import { isClient, isDev } from 'util/env'
import { convertVersionToInt } from 'util/version'
import { isPWAInstalled } from 'util/device'
import OneSignal from 'react-onesignal'
import { isStaffUser } from 'util/user'
import { FacebookPixelEvents } from 'ui/shared/FacebookPixelEvents'

const AppInit = () => {
  const visibilityTimestamp = useRef<number | null>(null)
  const oneSignalInitialized = useRef(false)
  useEffect(() => {
    if (isClient()) {
      Analytics.init()

      Analytics.setSuperProps({
        appVersion: process.env.APP_VERSION || 'unknown',
        appVersionCode:
          convertVersionToInt(process.env.APP_VERSION) || 'unknown',
      })

      if (!oneSignalInitialized.current) {
        oneSignalInitialized.current = true
        OneSignal.init({
          appId: process.env.ONE_SIGNAL_APP_ID!,
          allowLocalhostAsSecureOrigin: isDev(),
          autoRegister: false,
        })
      }

      const handleVisibilityChange = () => {
        // Get user uuid from the cookie
        const userUUID = document.cookie
          .split('; ')
          .find((row) => row.startsWith('uuid'))
          ?.split('=')[1]

        if (document.visibilityState === 'hidden') {
          visibilityTimestamp.current = Date.now() // Store the timestamp when app becomes invisible
        } else if (
          document.visibilityState === 'visible' &&
          visibilityTimestamp.current !== null &&
          isPWAInstalled() &&
          isStaffUser(userUUID) &&
          Date.now() - visibilityTimestamp.current >= 5 * 60 * 1000 // 5 minutes in milliseconds
        ) {
          window.location.reload() // Reload the app if 5 minutes have passed since becoming invisible
        }
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }
  }, [])

  return (
    <>
      <Suspense fallback={null}>
        <FacebookPixelEvents />
      </Suspense>
    </>
  )
}

// Make the install app event available to other components
// https://developer.mozilla.org/en-US/docs/Web/API/BeforeInstallPromptEvent
export let installEvent: BeforeInstallPromptEvent | null = null
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    const event = e as BeforeInstallPromptEvent
    e.preventDefault()
    installEvent = event
  })
}

export default AppInit
