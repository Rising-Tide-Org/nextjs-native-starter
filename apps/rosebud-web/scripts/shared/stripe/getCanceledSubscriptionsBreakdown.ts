import 'dotenv/config'

import type Stripe from 'stripe'
import { stripe } from 'util/stripe'

// Return type for categorized canceled subscriptions
type CategorizedCancelledSubscriptions = {
  subscriptionCancellations: Stripe.Subscription[]
  trialCancellations: Stripe.Subscription[]
}

/**
 * Categorizes given subscriptions into subscription cancellations and trial cancellations.
 *
 * @param {Stripe.Subscription[]} canceledSubs - List of canceled subscriptions.
 * @returns {Promise<CategorizedCancelledSubscriptions>} A promise that resolves with the categorized subscriptions.
 */
export const getCanceledSubscriptionsBreakdown = async (
  canceledSubs: Stripe.Subscription[]
): Promise<CategorizedCancelledSubscriptions> => {
  const subscriptionCancellations: Stripe.Subscription[] = []
  const trialCancellations: Stripe.Subscription[] = []

  for (const sub of canceledSubs) {
    const customer = sub.customer as Stripe.Customer

    try {
      // Fetch customer's payment history
      const paymentIntents = await stripe.paymentIntents.list({
        customer: customer.id,
      })

      // Determine if the customer made any successful payments
      const hasSuccessfulPayment = paymentIntents.data.some(
        (payment) => payment.status === 'succeeded'
      )

      // Categorize subscription based on payment history
      if (hasSuccessfulPayment) {
        subscriptionCancellations.push(sub)
      } else {
        trialCancellations.push(sub)
      }
    } catch (error) {
      console.error(
        `Error fetching payment history for customer ${customer.id}`
      )
    }
  }

  return {
    subscriptionCancellations,
    trialCancellations,
  }
}
