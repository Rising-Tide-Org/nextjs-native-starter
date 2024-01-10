import { initializeAdmin } from 'db-server'
import moment from 'moment'
import { NextApiRequest, NextApiResponse } from 'next'
import { isDev, isPreview } from 'util/env'
import AnalyticsServer from 'lib/analytics-server'
import { fetchMany } from 'db-server/fetch'
import { User } from 'types/User'
import { NotificationDeviceType } from 'types/Notification'
import { Prompt } from 'types/Prompt'
import {
  generateNotificationContent,
  generateNotificationUrl,
  sendNotification,
} from 'lib/onesignal'
import { updateRecord } from 'db-server/mutate'
import { logSlackMessage } from 'lib/slack'

// This does not need to be secret
// It's just a random string that is unlikely to be guessed
const AuthKey = '3b7988f4-fb2b-4a37-bba8-9c2f2gb03e41'

// Check if we are in development or preview mode
const isTest = isDev() || isPreview()

// Initialize Firebase Admin & Firestore
const app = await initializeAdmin()
const db = await app.firestore()

// Get the current UTC hour
const utcHour = moment().utc().hour()

// The source of the file for logging purposes
const source = 'dispatch-reminders-v2'

AnalyticsServer.init()

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { key, email } = req.query

  // This ensures it doesn't get accidentally hit from the outside
  // This is only triggered from a CRON job on Vercel
  if (key !== AuthKey) {
    await logSlackMessage(
      source,
      'personalized notifications endpoint hit without authorization'
    )
    return res.status(401).send({ success: false, error: 'Unauthorized' })
  }

  AnalyticsServer.trackEvent('', 'dispatch.reminders', {
    utcHour,
    content: 'personalized',
  })

  // If we are in test mode, you can only send a notification to a specific user
  if (isTest) {
    // If email is provided in test mode, send notification to that user
    if (email) {
      const { docs: testUsers } = await fetchMany<User>(db, 'users', (q) =>
        q.where('email', '==', email)
      )

      if (!testUsers.length) {
        logSlackMessage(source, `user ${email} not found`, 'error')
        return res.status(404).send({ success: false, error: 'User not found' })
      } else if (testUsers.length > 1) {
        logSlackMessage(source, `multiple users found for ${email}`)
      }

      await Promise.all([
        testUsers.forEach((doc) => {
          const user = doc.data() as User

          if (user?.notifications?.channel === 'push') {
            sendNotificationToUser(user, 'push', isTest)
            logSlackMessage(
              source,
              `sending personalized push notification to user ${email}`
            )
            return
          } else if (
            user?.notifications?.channel === 'sms' &&
            user.phoneVerified === true
          ) {
            sendNotificationToUser(user, 'sms', isTest)
            logSlackMessage(
              source,
              `sending personalized sms notification to user ${email}`
            )
            return
          } else {
            logSlackMessage(
              source,
              `user ${email} does not have a phone number or player ids`,
              'error'
            )
            return
          }
        }),
      ])

      logSlackMessage(
        source,
        `execution complete for user ${email} in test mode: ${isTest}`
      )
      return res.status(200).send({ success: true })
    } else {
      // Test mode can only be used with a specific user
      logSlackMessage(
        source,
        `this script can only be called with a specific user email in test mode: ${isTest}`,
        'error'
      )
      return res.status(404).send({ success: false })
    }
  }

  try {
    // Get all users who have notifications enabled for the current UTC hour
    const { docs: notificationEnabledUsers } = await fetchMany<User>(
      db,
      'users',
      (q) =>
        q
          .where('notifications.enabled', '==', true)
          .where('variants.notifications', '==', 'personalized')
          .where('reminder_hour_utc', '==', utcHour)
    )

    const pushNotificationUsers: User[] = []
    const smsNotificationUsers: User[] = []

    for (const doc of notificationEnabledUsers) {
      const user = doc.data() as User

      if (user?.notifications?.channel === 'push') {
        pushNotificationUsers.push(user)
        continue
      }

      if (
        user?.notifications?.channel === 'sms' &&
        user.phoneVerified === true
      ) {
        smsNotificationUsers.push(user)
        continue
      }
    }

    logSlackMessage(
      source,
      `sending personalized push notification to ${pushNotificationUsers.length} users @ ${utcHour} hours UTC`
    )
    for (const user of pushNotificationUsers) {
      await sendNotificationToUser(user, 'push', isTest)
    }

    logSlackMessage(
      source,
      `sending personalized sms notification to ${smsNotificationUsers.length} users @ ${utcHour} hours UTC`
    )
    for (const user of smsNotificationUsers) {
      await sendNotificationToUser(user, 'sms', isTest)
    }

    AnalyticsServer.trackEvent('', 'dispatch.reminders.success', {
      utcHour,
      content: 'personalized',
      pushNotificationUsers: pushNotificationUsers.length,
      smsNotificationUsers: smsNotificationUsers.length,
    })
  } catch (e) {
    const errorMessage = `unable to send personalized notifications @ ${utcHour} hours UTC ${e}`
    logSlackMessage(source, errorMessage, 'error')

    AnalyticsServer.trackEvent('', 'dispatch.reminders.error', {
      utcHour,
      content: 'personalized',
      error: errorMessage,
    })
  }

  logSlackMessage(
    source,
    `execution complete for personalized notifications @ ${utcHour} hours UTC`
  )
  res.status(200).send({ success: true })
}

/**
 * Asynchronously sends a notification to a user.
 *
 * - If the user is missing a phone number (for sms notification) or player IDs (for push notification), an error is tracked and the function returns.
 * - It then randomly picks a unsent notification prompts and generate the content content and URL based on that.
 * - The notification is then sent, an event is tracked, and if a prompt was used, it is marked as sent.
 * - If any errors occur during this process, they are tracked and an error event is tracked.
 *
 * @async
 * @function sendNotificationToUser
 * @param {User} user - The user to send the notification to.
 * @param {NotificationDeviceType} type - The type of notification to send ('sms' or 'push').
 * @param {boolean} test - Whether or not this is a test notification.
 */
const sendNotificationToUser = async (
  user: User,
  type: NotificationDeviceType,
  test: boolean
) => {
  if (type === 'sms' && !user.phone) {
    const e = 'user missing phone number'
    const errorMessage = `unable to deliver ${type} notification @ ${utcHour} hours UTC to user ${user.email} ${e}`
    logSlackMessage(source, errorMessage, 'error')
    return
  }

  if (type === 'push' && !user.notifications?.player_ids?.length) {
    const e = 'user missing player ids'
    const errorMessage = `unable to deliver ${type} notification @ ${utcHour} hours UTC to user ${user.email} ${e}`
    logSlackMessage(source, errorMessage, 'error')
    return
  }

  try {
    // Get generic notification content
    let content = generateNotificationContent(type)

    // Get generic webUrl for notification
    let webUrl = generateNotificationUrl(type)

    // The prompt id for the notification
    let promptId = undefined

    // Get phone number to send SMS to
    const phoneNumbers =
      type === 'sms' ? (user.phone && [user.phone]) || undefined : undefined

    // Get player ids to send push notification to
    const playerIds =
      type === 'push' ? user.notifications?.player_ids : undefined

    // Get notifications prompts that have not been sent yet
    const { data: notificationPrompts } = await fetchMany<Prompt>(
      db,
      'prompts',
      (q) =>
        q
          .where('type', '==', 'notification')
          .where('isVisible', '==', false)
          .orderBy('createdAt', 'desc')
          .limit(50),
      user.id
    )

    // If there are notification prompts, pick one at random and use that to get the content and URL
    // else if uses the generic content and URL generated above
    if (notificationPrompts?.length) {
      const prompt =
        notificationPrompts[
          Math.floor(Math.random() * notificationPrompts.length)
        ]
      promptId = prompt.id
      content = generateNotificationContent(type, prompt)
      webUrl = generateNotificationUrl(type, prompt)
    }

    const baseName = `personalized-${type}-utc-${utcHour}-${user.email}`
    const eventName = test ? `test-${baseName}` : baseName

    // Send push notification
    await sendNotification({
      eventName,
      content,
      webUrl,
      phoneNumbers,
      playerIds,
    })

    logSlackMessage(
      source,
      `sent personalized ${type} notification @ ${utcHour} hours UTC to user ${user.email}`
    )

    AnalyticsServer.trackEvent(
      user.uuid || '',
      'dispatch.reminders.send.success',
      {
        type,
        utcHour,
        content: 'personalized',
      }
    )

    // Mark prompt as visible so it shows up in the app & is not sent again
    if (promptId && user?.id) {
      await updateRecord<Prompt>(db, 'prompts', promptId, {
        userId: user.id,
        data: {
          isVisible: true,
        },
      })
    }
  } catch (e) {
    const errorMessage = `unable to deliver personalized ${type} notification @ ${utcHour} hours UTC to user ${user.email} ${e}`
    logSlackMessage(source, errorMessage, 'error')

    AnalyticsServer.trackEvent(
      user.uuid || '',
      'dispatch.reminders.send.error',
      {
        type,
        utcHour,
        content: 'personalized',
        error: errorMessage,
      }
    )
  }
}

export default handler
