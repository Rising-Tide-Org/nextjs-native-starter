import AnalyticsServer from 'lib/analytics-server'
import { dispatchReminders } from 'lib/reminders'
import { logSlackMessage } from 'lib/slack'
import moment from 'moment'
import { NextApiRequest, NextApiResponse } from 'next'
import { isDev, isPreview } from 'util/env'

// This does not need to be secret!
const AuthKey = '3b7988f4-fb2b-4a37-bba8-9c4f2eb0394b'

// The source of the file for logging purposes
const source = 'dispatch-reminders'

AnalyticsServer.init()

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { key } = req.query

  // We just need some basic way of making sure this doesn't get accidentally hit
  // by the outside, and only by the webhook.
  if (key !== AuthKey) {
    await logSlackMessage(
      source,
      'generic notifications endpoint hit without authorization',
      'error'
    )
    return res.status(401).send({ success: false, error: 'Unauthorized' })
  }

  // Check if we are in development or preview mode
  const isTest = isDev() || isPreview()

  // Get the current UTC hour
  const utcHour = moment().utc().hour()

  AnalyticsServer.trackEvent('', 'dispatch.reminders', {
    utcHour,
    content: 'generic',
  })

  try {
    // Dispatch reminders for the given UTC hour
    await dispatchReminders(utcHour, isTest)

    logSlackMessage(
      source,
      `sent all generic notifications @ ${utcHour} hours UTC`
    )

    AnalyticsServer.trackEvent('', 'dispatch.reminders.success', {
      utcHour,
      content: 'generic',
    })
  } catch (e) {
    const errorMessage = `unable to send generic notifications @ ${utcHour} hours UTC ${e?.message}`
    logSlackMessage(source, errorMessage, 'error')

    AnalyticsServer.trackEvent('', 'dispatch.reminders.error', {
      utcHour,
      content: 'generic',
      error: e?.message,
    })
  }

  logSlackMessage(
    source,
    `execution complete for generic notifications @ ${utcHour} hours UTC`
  )

  res.status(200).send({ success: true })
}

export default handler
