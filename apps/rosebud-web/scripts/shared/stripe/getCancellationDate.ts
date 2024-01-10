import 'dotenv/config'

import type Stripe from 'stripe'

export const getCancellationDate = (
  subscription: Stripe.Subscription
): Date => {
  let canceledDate = null

  if (subscription.cancel_at) {
    // This shows the date in the future at which the subscription will automatically get canceled
    canceledDate = new Date(subscription.cancel_at * 1000)
  } else if (subscription.canceled_at) {
    // This shows the date the subscription has been canceled
    canceledDate = new Date(subscription.canceled_at * 1000)
  } else {
    // TODO: this defaults to 1969 if the subscription has never been canceled
    canceledDate = new Date(1969, 0, 1)
  }

  return canceledDate
}
