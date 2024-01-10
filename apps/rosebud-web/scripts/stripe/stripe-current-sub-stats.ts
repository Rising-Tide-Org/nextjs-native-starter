import 'dotenv/config'

import logger from '../shared/logger'
import type Stripe from 'stripe'
import { getPaginatedSubscriptions } from '../shared/stripe/getPaginatedSubscriptions'
import { getUpcomingCancellations } from '../shared/stripe/getActiveStatusUpcomingCanceledSubs'

const getSubStats = async (status: 'active' | 'trialing') => {
  // Get all active subscriptions
  const allActiveSubs = await getPaginatedSubscriptions(
    status as Stripe.SubscriptionListParams.Status,
    false
  )

  // Get all upcoming canceled subscriptions
  const upcomingCanceledSubs = await getUpcomingCancellations(allActiveSubs)

  // Extract the IDs of upcoming canceled subscriptions
  const upcomingCanceledSubIds = new Set(
    upcomingCanceledSubs.map((sub) => sub.id)
  )

  // Remove the upcoming canceled subscriptions from the active subscriptions
  const activeSubs = allActiveSubs.filter(
    (sub) => !upcomingCanceledSubIds.has(sub.id)
  )

  // Log the active subscription stats
  logger.info(`Status: ${status}`)
  logger.info(`Subscriptions: ${activeSubs.length}`)
  // getIntervalBreakdownForSubs(activeSubs)

  // Log the upcoming canceled subscription stats
  logger.info(`Upcoming cancellations: ${upcomingCanceledSubs.length}`)
  // getIntervalBreakdownForSubs(upcomingCanceledSubs)
}

const run = async () => {
  await getSubStats('active')
  logger.info('')
  logger.info('')
  await getSubStats('trialing')
}

run()
