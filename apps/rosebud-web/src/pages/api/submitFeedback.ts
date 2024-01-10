import { NextApiRequest, NextApiResponse } from 'next'
import { isTruthy } from '../../util'
import { AirtableFeedbackTableFields } from 'types/Airtable'
import { captureException } from '@sentry/nextjs'
import Analytics from 'lib/analytics-server'
import withMiddleware from 'middleware'
import { ProductFeedback } from 'types/Feedback'
import { Airtable } from 'lib/airtable'
import { sendSlackMessage } from 'lib/slack'
import { getProductFeedbackSlackMessage } from 'util/slack'

const kFeedbackAirtable =
  'https://api.airtable.com/v0/appNlk8vk5UB4kQ5U/Feedback'
const kSlackWebhookUrl = process.env.SLACK_FEEDBACK_WEBHOOK_URL

// Initialize Analytics
Analytics.init()

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { feedback, phone, email, contactable, userId, utmCampaign } =
      JSON.parse(req.body) as ProductFeedback

    if (!feedback?.length) {
      res.status(400).json({ error: 'No feedback provided' })
      return
    }

    // Create a record in the Airtable base for the feedback
    try {
      const record: AirtableFeedbackTableFields = {
        Feedback: feedback,
        Phone: phone || '',
        Contactable: isTruthy(contactable, false),
        UserID: userId || '',
        Email: email || '',
      }

      await Airtable.createRecord(kFeedbackAirtable, record)
    } catch (err) {
      const error = new Error('Error creating Airtable record: ', err.message)
      captureException(error)
      throw error
    }

    // Send a Slack notification for the feedback
    try {
      const slackMessage = getProductFeedbackSlackMessage(
        userId,
        feedback,
        phone,
        email,
        utmCampaign
      )
      await sendSlackMessage(slackMessage, kSlackWebhookUrl)
    } catch (err) {
      const error = new Error('Error sending Slack message: ', err.message)
      captureException(error)
      throw error
    }

    res.status(200).json({ success: true })
  } catch (error) {
    captureException(error)

    return res
      .status(500)
      .json({ error: { statusCode: 500, message: error.message } })
  }
}

export default withMiddleware({
  methods: ['POST'],
  authenticated: true,
})(handler)
