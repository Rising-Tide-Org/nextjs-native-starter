import Mixpanel from 'mixpanel'
import { isDev } from 'util/env'
import { captureException as sentryCaptureException } from '@sentry/nextjs'
import type { Dict } from 'mixpanel-browser'

let INITIALIZED = false
let mixpanel = null as Mixpanel.Mixpanel | null

export namespace AnalyticsServer {
  export const init = () => {
    if (!INITIALIZED) {
      if (process.env.MIXPANEL_TOKEN) {
        mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN)
      }

      INITIALIZED = true
    }
  }

  export const trackEvent = (
    userId: string,
    eventName: string,
    eventProps: Dict = {}
  ) => {
    if (isDev()) {
      console.info(
        '%c[Analytics] %c%s',
        'color:green',
        'color:orange',
        eventName,
        userId,
        eventProps
      )
    }

    try {
      mixpanel?.track(eventName, {
        distinct_id: userId,
        ...eventProps,
      })
    } catch (e) {
      sentryCaptureException(e)
      console.error('Unable to log Analytics event', e)

      try {
        mixpanel?.track('mixpanel.error', {
          error_message: e.message,
          error: e,
        })
      } catch (err) {
        console.error('Failed to track failed mixpanel event', err)
        sentryCaptureException(err)
      }
    }
  }

  export const trackUserCharge = (
    userId: string,
    amount: number,
    eventProps?: Dict
  ) => {
    mixpanel?.people.track_charge(userId, amount, eventProps)
    mixpanel?.people.increment(userId, 'Lifetime Revenue', amount)
  }

  export const setUserProps = (userId: string, eventProps: Dict) => {
    if (isDev()) {
      console.info(
        '%c[Analytics] %c%s',
        'color:green',
        'color:orange',
        'people.set',
        userId,
        eventProps
      )
    }

    mixpanel?.people.set(userId, eventProps)
  }

  export const incrementUserProp = (
    userId: string,
    label: string,
    amount: number
  ) => {
    mixpanel?.people.increment(userId, label, amount)
  }
}

export default AnalyticsServer
