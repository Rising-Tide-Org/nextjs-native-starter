import { NextApiResponse } from 'next'
import { buildSubscriptionObject, stripe } from 'util/stripe'
import type Stripe from 'stripe'
import { logSlackMessage } from 'lib/slack'
import withMiddleware from 'middleware'
import { NextAuthApiRequest } from 'middleware/tokenVerification'
import { SubscriptionSource } from 'types/Subscription'
import { kSubscriptionSource } from 'constants/subscriptionSource'

const handler = async (req: NextAuthApiRequest, res: NextApiResponse) => {
  try {
    const user = req._user!
    const userId = user.id
    const uuid = user.uuid

    const { subscriptionId, customerId, sessionId } = JSON.parse(req.body)

    if (!customerId && !subscriptionId && !sessionId && !userId) {
      throw Error(
        'Need a valid customer, subscription, session or user id to fetch a subscription'
      )
    }

    /**
     * STEP 1. Find the right Customer object
     */

    let customer: Stripe.Customer | undefined

    // In an ideal world, every customer has a `uid` in the metadata and we can rely on that
    // In a more ideal world, every user has the right customer id on their subscription object
    // Due to inconsistent legacy user issues, we'll look up on both to be safe for now
    if (userId) {
      const customers = await stripe.customers.search({
        query: `metadata['uid']:'${userId}'`,
        expand: ['data.subscriptions'],
      })
      // If there are multiple customers with this uid, prefer the one with a subscription
      if (customers.data.length > 0) {
        // This does not handle the case where a user has two customers with subs on each
        // Likely very edge, and will leave it to manual resolution
        customer = customers.data.find((c) =>
          c.subscriptions?.data?.find((s) =>
            ['active', 'trialing'].includes(s.status)
          )
        )

        // Log to Slack when we encounter a user with multiple Stripe customers
        if (customers.data.length > 1) {
          const slackMessage = `Encountered user with ${
            customers.data.length
          } Stripe customers (${customers.data.map(
            (c) => '`' + c.id + '`'
          )}) uid: \`${userId}\``
          await logSlackMessage('api-payment-subscription', slackMessage)
        }
      } else {
        customer = customers.data[0]
      }
    }

    // If we can't fetch a customer by userId, try to fetch it directly
    if (!customer && customerId) {
      customer = (await stripe.customers.retrieve(
        customerId
      )) as Stripe.Customer
    }

    // If no customer yet, try to find it by subscription id
    if (!customer && subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['customer'],
      })
      customer = subscription.customer as Stripe.Customer
    }

    // If there is no customer yet and we have a session id, try to find it by session id
    if (!customer && sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['customer'],
      })
      customer = session.customer as Stripe.Customer
    }

    // If we can't find a customer, bail and return null
    if (!customer) {
      return res.status(200).json({ response: null })
    }

    if (
      // If the customer is missing some metadata
      (!customer.metadata?.['uuid'] || !customer.metadata?.['uid']) &&
      // And has uid and uuid in the request, update metadata
      userId &&
      uuid
    ) {
      await stripe.customers.update(customerId, {
        metadata: {
          uid: userId,
          uuid,
        },
      })
    }

    /**
     * STEP 2. Find the right subscription
     *
     * At this point, we're guaranteed to have a customer.
     * Let's fetch the customer's full subscription data and find the most relevant one
     */

    const { data: subscriptions } = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
    })

    // If there is no subscription, it's very important to
    // still return the customer
    if (!subscriptions.length) {
      return res.status(200).json({ response: { customerId: customer.id } })
    }

    // Log to Slack when we encounter a user with multiple subs
    if (
      subscriptions.filter((s) => ['active', 'trialing'].includes(s.status))
        .length > 1
    ) {
      const slackMessage = `Encountered user with ${subscriptions.length} live subscriptions (uid: \`${customer.metadata?.uid}\`, customerId: \`${customer.id}\`)`
      await logSlackMessage('api-payment-subscription', slackMessage)
    }

    // Sort subscriptions based on relevance, puts unknown statuses at the end
    const prioritySort = [
      'active',
      'trialing',
      'past_due',
      'unpaid',
      'canceled',
    ]
    const prioritySorted = [...subscriptions].sort((a, b) => {
      const indexA = prioritySort.indexOf(a.status)
      const indexB = prioritySort.indexOf(b.status)
      return indexA === -1 || indexB === -1 ? indexB - indexA : indexA - indexB
    })

    // Pick best subscription to return
    const stripeSubscription = prioritySorted[0]

    // Build and return the subscription object
    const subscription = buildSubscriptionObject(stripeSubscription, customer)

    const upgradeSource = customer.metadata?.upgradeSource as SubscriptionSource

    if (upgradeSource && kSubscriptionSource.includes(upgradeSource)) {
      subscription.upgradeSource = upgradeSource
    } else {
      subscription.upgradeSource = 'unknown'
    }

    return res.status(200).json({
      response: subscription,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: { statusCode: 500, message: error.message } })
  }
}

export default withMiddleware({
  methods: ['POST'],
  authenticated: true,
})(handler)
