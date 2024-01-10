import { NextApiResponse } from 'next'
import {
  determineSubscriptionTier,
  getRetentionDuration,
  stripe,
} from 'util/stripe'
import type Stripe from 'stripe'
import withMiddleware from 'middleware'
import { NextAuthApiRequest } from 'middleware/tokenVerification'
import { AirtableCancellationFeedbackFields } from 'types/Airtable'
import { Airtable } from 'lib/airtable'
import { getSubCancelledInProductSlackMessage } from 'util/slack'
import { sendSlackMessage } from 'lib/slack'
import { SubscriptionWithPlan } from 'types/Stripe'
import { getSubscriptionType } from 'lib/stripe'
import Analytics from 'lib/analytics-server'
import { MixpanelUserProps } from 'constants/analytics'
import { Klaviyo } from 'lib/klaviyo'
import { captureException } from '@sentry/nextjs'
import { formatCurrency } from 'util/currency'
import { ucFirst } from 'util/string'

const kCancellationFeedbackAirtable =
  'https://api.airtable.com/v0/appNlk8vk5UB4kQ5U/Cancellation%20Feedback'
const kSlackWebhookUrl = process.env.SLACK_CANCELLATION_WEBHOOK_URL

// Initialize Analytics
Analytics.init()

/**
 * Handles a request to cancel a Stripe subscription.
 *
 * The function follows these steps:
 * 1. Fetches the subscription using the provided `subscriptionId` and retrieves the associated `customerId`.
 * 2. Fetches the customer using the `customerId` from the subscription.
 * 3. Validates that the `userId` from the authenticated request matches the `uid` in the customer's metadata.
 * 4. If the validation passes, the function cancels the subscription
 *    - If the cancellation is not immediate, the subscription will remain in an 'active' state until the end of the billing period, at which point it will transition to 'canceled'.
 *    - If the cancellation is immediate (immediateCancellation = true), the subscription is canceled immediately with a 'canceled' status.
 *
 * In addition to canceling the subscription, the function also:
 * - Creates a record in the Airtable base for the cancellation feedback.
 * - Sends a Slack notification for the cancellation.
 * - Sends an email to the user with the exit survey.
 *
 * @param {NextAuthApiRequest} req - The incoming request object.
 * @param {NextApiResponse} res - The outgoing response object.
 * @returns {Promise<void>} Sends a response with the canceled subscription's ID, or an error.
 * @throws Will throw an error if the validation fails or if there's an issue with the Stripe API.
 */
const handler = async (req: NextAuthApiRequest, res: NextApiResponse) => {
  try {
    const user = req._user!
    const userId = user.id
    const userUuid = user.uuid || 'missing'

    const {
      subscriptionId,
      immediateCancellation,
      email,
      phone,
      reason,
      moreDetails,
    } = JSON.parse(req.body)

    if (!subscriptionId) {
      throw Error('Subscription ID is required to cancel a subscription.')
    }

    // Fetch the subscription to ensure it exists and retrieve its associated customer ID
    const subscription = (await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['plan'],
    })) as unknown as SubscriptionWithPlan

    if (!subscription?.customer) {
      throw Error('Unable to retrieve the subscription or associated customer.')
    }

    // Retrieve the customer to ensure the current user has permission
    const customer = (await stripe.customers.retrieve(
      subscription.customer as string
    )) as Stripe.Customer

    // Check the user's ID against the customer's metadata to ensure a match
    if (customer.metadata?.uid !== userId) {
      throw Error('You do not have permission to cancel this subscription.')
    }

    // Get the subscription type (trial or subscription)
    const type = await getSubscriptionType(subscription)

    // Get the subscription tier (bloom, lite, undefined)
    const tier = ucFirst(
      determineSubscriptionTier(subscription?.plan.product?.toString()) ||
        'none'
    )

    // Get the plan price & interval for the existing subscription
    const price = formatCurrency('USD', subscription.plan.amount || 0)
    const interval = subscription.plan.interval

    // Get the utm_campaign from the customer metadata
    const utmCampaign = customer.metadata?.utm_campaign

    // This will contain the updated subscription object after the cancellation
    let updatedSubscription = null

    // If validation passes, cancel the subscription
    if (immediateCancellation) {
      // Cancel subscription immediately with a 'canceled' status
      updatedSubscription = await stripe.subscriptions.del(subscriptionId)
    } else {
      // The subscription will remain in an 'active' state until the end of the billing period,
      // at which point it will transition to 'canceled'.
      updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      })
    }

    // Get the retention duration for the subscription
    const retentionDuration = getRetentionDuration(updatedSubscription)

    // Get the date the subscription was canceled
    const canceledAtDate = updatedSubscription.canceled_at
      ? new Date(updatedSubscription.canceled_at * 1000)
      : undefined

    Analytics.trackEvent(userUuid, 'subscription.canceled', {
      customerId: customer.id,
      subscriptionId: updatedSubscription.id,
      type,
      tier,
      price,
      interval,
      utmCampaign,
      retentionDuration,
      reason,
      feedback: moreDetails,
      canceledAt: canceledAtDate,
    })

    Analytics.setUserProps(userUuid, {
      [MixpanelUserProps.subscriptionStatus]: updatedSubscription.status,
      [MixpanelUserProps.cancellationReason]: reason,
      [MixpanelUserProps.cancellationFeedback]: moreDetails,
      [MixpanelUserProps.canceledAtDate]: canceledAtDate,
    })

    // Create a record in the Airtable base for the cancellation feedback
    try {
      const record: AirtableCancellationFeedbackFields = {
        UserID: userUuid,
        Email: email,
        Phone: phone,
        Reason: reason,
        More_Details: moreDetails,
        SubscriptionID: subscriptionId,
        Type: type,
        Tier: tier,
        Price: price,
        Interval: interval,
        Retention: retentionDuration,
        Utm_Campaign: utmCampaign,
        Canceled_At: canceledAtDate,
      }
      await Airtable.createRecord(kCancellationFeedbackAirtable, record)
    } catch (error) {
      captureException(
        new Error('Error creating Airtable record: ', error.message)
      )
    }

    // Send a Slack notification for the cancellation
    try {
      const slackMessage = getSubCancelledInProductSlackMessage(
        userUuid,
        email,
        phone,
        reason,
        moreDetails,
        customer.id,
        type,
        tier,
        price,
        interval,
        retentionDuration,
        utmCampaign
      )
      await sendSlackMessage(slackMessage, kSlackWebhookUrl)
    } catch (error) {
      console.error('Error sending Slack message: ', error)
    }

    // Send an email to the user with the exit survey
    try {
      await Klaviyo.subscribeUserToList(
        email,
        Klaviyo.kListIds.CanceledSubscribers,
        'Canceled Subscription'
      )
      Analytics.trackEvent(userUuid, 'dripEvent.sent', {
        email,
        event: 'canceled-subscription',
      })
    } catch (error) {
      console.error('Error sending exit survey email: ', error)
      Analytics.trackEvent(userUuid, 'dripEvent.failed', {
        event: 'canceled-subscription',
        error: error.message,
      })
    }

    return res.status(200).json({ response: updatedSubscription.id })
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
