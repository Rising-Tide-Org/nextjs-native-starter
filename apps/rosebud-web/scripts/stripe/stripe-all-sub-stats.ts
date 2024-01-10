import 'dotenv/config'

import type Stripe from 'stripe'
import logger from '../shared/logger'
import { getPaginatedSubscriptions } from '../shared/stripe/getPaginatedSubscriptions'

const allSubsStats = async () => {
  const statusCounts: Record<Stripe.SubscriptionListParams.Status, number> = {
    active: 0,
    canceled: 0,
    ended: 0,
    incomplete: 0,
    incomplete_expired: 0,
    past_due: 0,
    paused: 0,
    trialing: 0,
    unpaid: 0,
    all: 0,
  }

  for (const status of Object.keys(
    statusCounts
  ) as Stripe.SubscriptionListParams.Status[]) {
    const subs = await getPaginatedSubscriptions(status, false)
    statusCounts[status] = subs.length
  }

  const sortedStatusCounts = Object.entries(statusCounts).sort(
    ([, countA], [, countB]) => countB - countA
  )

  logger.info('[subscriptions] Subscription counts by status:')
  for (const [status, count] of sortedStatusCounts) {
    logger.info(`Status: ${status}, Count: ${count}`)
  }
}

allSubsStats()
