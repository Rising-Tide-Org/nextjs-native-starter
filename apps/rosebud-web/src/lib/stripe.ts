import Stripe from 'stripe'
import { stripe } from 'util/stripe'

/**
 * Determines the type of a subscription based on past payment intents.
 *
 * @param {Stripe.Subscription} subscription - Stripe Subscription object.
 * @returns {Promise<string>} Subscription type: 'subscription' if at least one successful payment was made; 'trial' otherwise.
 */
export const getSubscriptionType = async (
  subscription: Stripe.Subscription
): Promise<string> => {
  try {
    // Get all past payment intents for the customer
    const pastPaymentIntents = await stripe.paymentIntents.list({
      customer: subscription?.customer.toString(),
    })
    // Filter to only get successful payment intents
    const successfulPaymentIntents = pastPaymentIntents.data.filter(
      (paymentIntent) => paymentIntent.status === 'succeeded'
    )

    // If the user has made at least one successful payment in the past
    // The type is a "paid" subscription
    if (successfulPaymentIntents.length > 0) {
      return 'sub'
    } else {
      return 'trial'
    }
  } catch (error) {
    console.error('Error getting past payment intents', error)
    return 'missing'
  }
}
