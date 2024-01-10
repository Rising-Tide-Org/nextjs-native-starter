import {
  createConfiguration,
  DefaultApi,
  Notification,
} from '@onesignal/node-onesignal'
import moment from 'moment'
import { NotificationDeviceType } from 'types/Notification'
import { kDeploymentUrl } from 'util/env'
import { Prompt } from 'types/Prompt'
import { NotificationsVariant } from 'constants/notifications'
import { logSlackMessage } from './slack'
import AnalyticsServer from './analytics-server'

const config = createConfiguration({
  userKey: process.env.NEXT_PUBLIC_ONE_SIGNAL_APP_ID,
  appKey: process.env.ONE_SIGNAL_API_KEY,
})

export const oneSignalClient = new DefaultApi(config)

const kMessages = [
  'Ready to reflect on your day?',
  'What was the highlight of your day?',
  'What are you grateful for today?',
  'What did you learn today?',
  'What was challenging today?',
]

export type DispatchResponseType = {
  error?: string
  recipients: number
  utcHour: number
  at: string
  name: string
  test: boolean
}

/**
 * WARNING: DO NOT CHANGE THIS WITHOUT A PROPER WAY TO MIGRATE THE USERS
 */
const kReminderHourTag = 'reminder_at_utc_hour'

/**
 * WARNING: DO NOT CHANGE THIS WITHOUT A PROPER WAY TO MIGRATE THE USERS
 */
const kNotificationsTag = 'notifications'

AnalyticsServer.init()

/**
 * Sends daily reminder to all users tagged with the given hour
 */
export async function sendDailyReminderBatch(
  utcHour: number,
  type: NotificationDeviceType,
  test: boolean
): Promise<void> {
  const baseName = `generic-${type}-utc-${utcHour}`
  const name = test ? `test-${baseName}` : baseName

  if (!process.env.ONE_SIGNAL_APP_ID) {
    throw new Error('missing OneSignal credentials')
  }

  let notification: Notification = {
    app_id: process.env.ONE_SIGNAL_APP_ID,
    name,
    contents: {
      en: generateNotificationContent(type),
    },
    send_after: moment.utc().startOf('day').set('hour', utcHour).toISOString(),
    filters: [
      {
        field: 'tag',
        key: kReminderHourTag,
        relation: 'exists',
      },
      {
        field: 'tag',
        key: kReminderHourTag,
        relation: '=',
        value: String(utcHour),
      },
      // This filters out users who have personalized notifications
      // Those notifications are sent from the dispatch-reminders-v2 endpoint
      {
        field: 'tag',
        key: kNotificationsTag,
        relation: '!=',
        value: NotificationsVariant.personalized,
      },
    ],
  }

  if (type === 'sms') {
    notification = {
      ...notification,
      sms_from: process.env.TWILIO_NUMBER,
    }
  }

  if (test) {
    logSlackMessage(
      'dispatch-reminders',
      `stub generic ${type} notifications @ ${utcHour} hours UTC in test mode: ${test}`
    )
    return
  }

  try {
    await oneSignalClient.createNotification(notification)

    logSlackMessage(
      'dispatch-reminders',
      `sent generic ${type} notifications @ ${utcHour} hours UTC`
    )

    AnalyticsServer.trackEvent('', 'dispatch.reminders.send.success', {
      type,
      utcHour,
      content: 'generic',
    })
  } catch (e) {
    const errorMessage = `unable to deliver generic ${type} notifications @ ${utcHour} hours UTC ${e?.message}`
    logSlackMessage('dispatch-reminders', errorMessage, 'error')

    AnalyticsServer.trackEvent('', 'dispatch.reminders.send.error', {
      type,
      utcHour,
      content: 'generic',
      error: errorMessage,
    })
    throw new Error(e)
  }
}

/**
 * Sends a notification to specific playerIds or phoneNumbers
 * Does not allow sending to both playerIds and phoneNumbers, must be either.
 */
export async function sendNotification({
  eventName,
  content,
  // The URL to open when a user clicks on the push notification
  // This is only included for PWAs
  webUrl = `${kDeploymentUrl()}/?n`,
  playerIds = [],
  phoneNumbers = [],
}: {
  eventName: string
  content: string
  webUrl?: string
  playerIds?: string[]
  phoneNumbers?: string[]
}) {
  try {
    if (!playerIds.length && !phoneNumbers.length) {
      throw new Error('Missing playerIds or phoneNumbers')
    }

    let notification: Notification = {
      name: eventName,
      app_id: process.env.ONE_SIGNAL_APP_ID!,
      contents: {
        en: content,
      },
    }

    if (playerIds.length) {
      notification = {
        ...notification,
        web_url: webUrl,
        include_player_ids: playerIds,
      }
    } else if (phoneNumbers.length) {
      notification = {
        ...notification,
        sms_from: process.env.TWILIO_NUMBER,
        include_phone_numbers: phoneNumbers,
      }
    }

    const resp = await oneSignalClient.createNotification(notification)

    const recipientResponse = {
      name: eventName,
      at: moment.utc().toString(),
      recipients: resp?.recipients || 0,
    }

    if (resp.errors && Object.keys(resp.errors).length) {
      return {
        ...recipientResponse,
        error: JSON.stringify(resp.errors),
      }
    }

    return recipientResponse
  } catch (e) {
    console.error(e)
  }
}

export function generateNotificationContent(
  type: NotificationDeviceType,
  prompt?: Prompt
) {
  const message =
    prompt?.question || kMessages[Math.floor(Math.random() * kMessages.length)]

  let url = generateNotificationUrl(type, prompt)
  if (prompt?.question) {
    url = `Reflect on Rosebud: ${url}`
  }

  if (type === 'push') {
    return `${message}`
  } else {
    return `${message}\n\n${url}\n\nReply STOP to unsubscribe`
  }
}

export function generateNotificationUrl(
  type: NotificationDeviceType,
  prompt?: Prompt
) {
  if (prompt) {
    const promptUrl = `${kDeploymentUrl()}/compose/prompt-${prompt.id}`

    // If it's a push notification, we can add additional UTM params for tracking
    if (type === 'push') {
      return `${promptUrl}/?utm_source=notification&utm_medium=${type}&utm_campaign=personalized-daily-reminder`
    } else {
      // Otherwise, we just return the prompt URL
      return `${promptUrl}/?n`
    }
  } else {
    // If it's a push notification, we can add additional UTM params for tracking
    if (type === 'push') {
      return `${kDeploymentUrl()}/?utm_source=notification&utm_medium=${type}&utm_campaign=generic-daily-reminder`
    } else {
      // Otherwise, we just return the prompt URL
      return `${kDeploymentUrl()}/?n`
    }
  }
}
