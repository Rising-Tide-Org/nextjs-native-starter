import 'dotenv/config'
import type Stripe from 'stripe'

export const getUpcomingCancellations = async (
  subscriptions: Stripe.Subscription[]
): Promise<Stripe.Subscription[]> => {
  // Filter upcoming active subscriptions with a future canceled_at date
  const upcomingCancellations: Stripe.Subscription[] = []

  for (const sub of subscriptions) {
    if (sub.cancel_at && sub.cancel_at > Math.floor(Date.now() / 1000)) {
      upcomingCancellations.push(sub)
    }
  }

  return upcomingCancellations
}
