import mixpanel, { Dict } from 'mixpanel-browser'
import { Entry } from 'types/Entry'
import { User } from 'types/User'
import { isDev } from 'util/env'
import ReactGA from 'react-ga4'
import { captureException as sentryCaptureException } from '@sentry/nextjs'
import { GPTModel } from 'constants/models'
import { entryLength } from 'util/entries'
import { kDefaultMixpanelUserProps } from 'constants/analytics'
import { getUTMParams } from 'util/window'

let INITIALIZED = false

export namespace Analytics {
  export const init = () => {
    if (!INITIALIZED) {
      if (process.env.GA_TRACKING_ID) {
        ReactGA.initialize(process.env.GA_TRACKING_ID, {
          gtagUrl: 'https://www.googletagmanager.com/gtag/js',
        })

        ReactGA.gtag('config', 'AW-11111998193', {
          // TLDR: Improves the accuracy of your conversion measurement; supplements your existing conversion tags by sending hashed first-party conversion data
          // Docs: https://support.google.com/google-ads/answer/13258081?#Add_a_code_snippet&zippy=%2Cidentify-and-define-your-enhanced-conversions-fields%2Cconfigure-your-conversion-page-google-tag
          allow_enhanced_conversions: true,
        })

        ReactGA.gtag('set', 'appVersion', process.env.APP_VERSION || 'unknown')
      } else {
        console.debug(
          '%c[Analytics] %c%s',
          'color:green',
          'color:red',
          'GA tracking not setup.'
        )
      }

      if (process.env.MIXPANEL_TOKEN) {
        mixpanel.init(process.env.MIXPANEL_TOKEN, {
          cross_site_cookie: true,
          api_host: '/mp',
          ignore_dnt: true,
        })
      }

      INITIALIZED = true
    }
  }

  export const identify = (userId: string) => {
    if (userId) {
      ReactGA.gtag('set', 'user_properties', {
        crm_id: userId,
      })
      console.debug('Identifying user', userId)
      mixpanel.identify(userId.toString())
    }
  }

  export const reset = () => {
    mixpanel.reset()
  }

  export const timeEvent = (eventName: string) => {
    if (isDev()) {
      console.info(
        '%c[Analytics] Time tracking start: %c%s',
        'color:green',
        'color:orange',
        eventName
      )
    }

    // Calling this multiple times will overwrite the previous timer
    mixpanel.time_event(eventName)
  }

  export const trackEvent = (eventName: string, eventProps?: Dict) => {
    if (isDev()) {
      console.info(
        '%c[Analytics] %c%s',
        'color:green',
        'color:orange',
        eventName,
        eventProps
      )
    }

    try {
      mixpanel.track(eventName, {
        ...eventProps,
        'Local Hour': new Date().getHours(),
      })
    } catch (e) {
      sentryCaptureException(e)
      console.error('Unable to log Analytics event', e)

      try {
        mixpanel.track('mixpanel.error', {
          error_message: e.message,
          error: e,
        })
      } catch (err) {
        console.error('Failed to track failed mixpanel event', err)
        sentryCaptureException(err)
      }
    }

    try {
      const gaEventName = eventName.split('.')
      ReactGA.event(gaEventName.join('_'))

      if (
        gaEventName.length > 1 &&
        gaEventName[gaEventName.length - 1] === 'view'
      ) {
        ReactGA.send({
          hitType: 'pageview',
          page: `/view/${gaEventName.slice(1).join('_')}`,
        })
      }
    } catch (error) {
      sentryCaptureException(error)
    }
  }

  export const trackGAConversionEvent = (
    paymentValue: number,
    transactionId: string,
    metadata: Record<string, string | number | boolean | undefined | null> = {}
  ) => {
    const conversionId = 'AW-11111998193'
    const conversionLabel = 'nRwHCJnk4psYEPHFzrIp'

    ReactGA.gtag('event', 'subscription_buy_success', {
      send_to: `${conversionId}/${conversionLabel}`,
      value: paymentValue,
      currency: 'USD',
      transaction_id: transactionId,
      ...metadata,
    })
  }

  export const incrementUserProp = (propName: string, amount = 1) => {
    mixpanel.people.increment(propName, amount)
  }

  export const setUserPropsFromUser = (user?: User | null) => {
    if (!user?.uuid) {
      return
    }
    const { email, phone, ...userProps } = user

    const specialProps = {
      $email: email,
      $phone: phone,
    }

    // Replace the sensitive profile.bio value with a boolean indicating whether it's set
    const filteredUserProps = {
      ...userProps,
      profile: {
        ...userProps.profile,
        bio: Boolean(userProps.profile?.bio),
      },
    }

    const peopleProps = {
      ...specialProps,
      ...filteredUserProps,
    }

    mixpanel.people.set(peopleProps)

    // Set initial properties — won't override existing values
    mixpanel.people.set_once({
      ...kDefaultMixpanelUserProps,
      ...getUTMParams(),
    })
  }

  export const setUserProps = (props: Dict) => {
    mixpanel.people.set(props)
  }

  export const setSuperProps = (props: Dict) => {
    mixpanel.register(props)
  }

  export const setSuperPropsOnce = (props: Dict) => {
    mixpanel.register_once(props)
  }
}

export namespace AnalyticsProps {
  export const entryProps = (
    entry: Entry = {
      questions: [],
      commitments: [],
    }
  ) => ({
    countPrompts: entry.questions?.length ?? 0,
    countCommitments: entry.commitments?.length ?? 0,
    lengthEntry: entry.questions?.map((q) => q.response.join('\n')).join('')
      .length,
    lengthRose:
      entry.questions?.find((q) => q.id === 'rose')?.response.join('\n')
        ?.length ?? 0,
    lengthThorn:
      entry.questions?.find((q) => q.id === 'thorn')?.response.join('\n')
        ?.length ?? 0,
    lengthBud:
      entry.questions?.find((q) => q.id === 'bud')?.response.join('\n')
        ?.length ?? 0,
  })

  export const openAiUsageProps = (
    entries: Entry[],
    responseLength: number,
    model: GPTModel
  ) => ({
    requestLength: entryLength(entries),
    responseLength,
    totalLength: entryLength(entries) + responseLength,
    model,
  })
}

export default Analytics
