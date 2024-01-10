import 'dotenv/config'

import type Stripe from 'stripe'
import { uniqBy } from 'lodash'

import { getPaginatedSubscriptions } from './getPaginatedSubscriptions'

// Return type for canceled subscriptions
type CancelledSubscriptions = {
  allCanceledSubs: Stripe.Subscription[]
  canceledSubs: Stripe.Subscription[]
  duplicateCanceledCount: number
}

/**
 * Retrieves and categorizes all canceled subscriptions.
 *
 * @returns {Promise<CancelledSubscriptions>} A promise that resolves with the cancelled subscriptions object
 */
export const getCanceledSubscriptions = async (
  type: 'past' | 'upcoming'
): Promise<CancelledSubscriptions> => {
  // Fetch all canceled subscriptions
  let allSubs: Stripe.Subscription[] = []

  if (type === 'past') {
    // Fetch all canceled subscriptions
    const allCanceledSubs = await getPaginatedSubscriptions('canceled', false)
    allSubs = allCanceledSubs
  } else if (type === 'upcoming') {
    const activeSubs = await getPaginatedSubscriptions('active', false)
    const trialingSubs = await getPaginatedSubscriptions('trialing', false)

    // Filter upcoming active subscriptions with a future canceled_at date
    const upcomingActiveCancelledSubs: Stripe.Subscription[] = []
    for (const sub of activeSubs) {
      if (sub.cancel_at && sub.cancel_at > Math.floor(Date.now() / 1000)) {
        upcomingActiveCancelledSubs.push(sub)
      }
    }

    // Filter upcoming trialing subscriptions with a future canceled_at date
    const upcomingTrialingCanceledSubs: Stripe.Subscription[] = []
    for (const sub of trialingSubs) {
      if (sub.cancel_at && sub.cancel_at > Math.floor(Date.now() / 1000)) {
        upcomingTrialingCanceledSubs.push(sub)
      }
    }

    allSubs = [...upcomingActiveCancelledSubs, ...upcomingTrialingCanceledSubs]
  }

  // Track email occurrences
  const emailCount: { [email: string]: number } = {}
  for (const sub of allSubs) {
    const customerEmail = (sub.customer as Stripe.Customer)?.email || 'notset'
    emailCount[customerEmail] = (emailCount[customerEmail] || 0) + 1
  }

  // Deduplicate subscriptions based on customer email
  const canceledSubs = uniqBy(allSubs, (sub: Stripe.Subscription) => {
    return (sub.customer as Stripe.Customer)?.email
  })

  // Compute the count of duplicate cancellations
  const duplicateCanceledCount = Object.values(emailCount)
    .filter((count) => count > 1)
    .reduce((acc, count) => acc + count - 1, 0)

  return {
    allCanceledSubs: allSubs,
    canceledSubs,
    duplicateCanceledCount,
  }
}
