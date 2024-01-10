import { fetchNextApi } from 'net/api'
import { Stripe } from 'stripe'
import { Subscription, SubscriptionSource } from 'types/Subscription'
import { UtmParams } from 'types/User'

/**
 * @param priceId
 * @param returnUrl should be in the format of /subscription
 */
export const createCheckoutSession = (
  customerId: string,
  priceId: string,
  returnUrl?: string,
  coupon?: string
) =>
  fetchNextApi<{ sessionId: string }>('/api/payment/new-checkout', {
    method: 'POST',
    body: JSON.stringify({
      customerId,
      priceId,
      returnUrl,
      coupon,
    }),
  })

export const createPortalLink = (
  customerId: string,
  subscriptionId: string,
  returnPath?: string
) =>
  fetchNextApi<{ url: string }>('/api/payment/create-portal-link', {
    method: 'POST',
    body: JSON.stringify({ customerId, subscriptionId, returnPath }),
  })

export const getSubscription = ({
  userId,
  sessionId,
  customerId,
  subscriptionId,
}: {
  userId?: string | null
  sessionId?: string | null
  customerId?: string | null
  subscriptionId?: string | null
}) =>
  fetchNextApi<Subscription>('/api/payment/subscription', {
    method: 'POST',
    body: JSON.stringify({ userId, subscriptionId, customerId, sessionId }),
  })

export const createNewCustomer = (
  uid: string,
  uuid: string,
  upgradeSource: SubscriptionSource,
  utmParams: UtmParams
) =>
  fetchNextApi<string>('/api/payment/create-customer', {
    method: 'POST',
    body: JSON.stringify({ uid, uuid, upgradeSource, utmParams }),
  })

export const getStripeCheckoutSession = (sessionId: string) =>
  fetchNextApi<Stripe.Checkout.Session>('/api/payment/fetch-session', {
    method: 'POST',
    body: JSON.stringify({ sessionId }),
  })

// Cancels a Stripe subscription by subscription ID.
export const cancelSubscription = (
  subscriptionId: string | null,
  immediateCancellation = false,
  email?: string,
  phone?: string,
  reason?: string,
  moreDetails?: string
) =>
  fetchNextApi<Subscription>('/api/payment/cancel-subscription', {
    method: 'POST',
    body: JSON.stringify({
      subscriptionId,
      immediateCancellation,
      email,
      phone,
      reason,
      moreDetails,
    }),
  })
