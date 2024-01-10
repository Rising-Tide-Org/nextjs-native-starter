import {
  minimumIOSMajorVersion,
  minimumIOSMinorVersion,
} from 'constants/notifications'
import { isClient } from './env'

export const isMobileDevice = () => {
  return (
    isClient() &&
    (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) ||
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0)
  )
}

/**
 * This function checks if the user has installed the PWA on their device,
 * it's not 100% accurate but it's good enough for our use case.
 *
 * https://developer.mozilla.org/en-US/docs/Web/CSS/@media/display-mode
 *
 * @returns true if the user is running in standalone mode (AKA PWA)
 */
export const isPWAInstalled = () => {
  return isClient() && window.matchMedia('(display-mode: standalone)').matches
}

export const isIOS = () => /iP(hone|od|ad)/.test(window.navigator.platform)

const getIOSversion = () => {
  if (isIOS()) {
    // supports iOS 2.0 and later
    const v = window.navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/) || []
    return [parseInt(v[1], 10), parseInt(v[2], 10)]
  }
}

export const isiOSWebPushSupported = () => {
  const version = getIOSversion() || []

  // This assumes that its a non iOS device
  if (version.length === 0) {
    return true
  }

  return (
    version[0] > minimumIOSMajorVersion ||
    (version[0] === minimumIOSMajorVersion &&
      version[1] >= minimumIOSMinorVersion)
  )
}
