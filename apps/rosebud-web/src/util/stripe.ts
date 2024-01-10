import Stripe from 'stripe'
import { Readable } from 'node:stream'
import {
  PriceDiscount,
  Subscription,
  SubscriptionTier,
} from 'types/Subscription'
import {
  kSubscriptionFields,
  kRemapFieldsForSubscription,
  kProductPackages,
} from 'constants/premium'
import { formatDuration } from './date'
import moment from 'moment'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  // https://github.com/stripe/stripe-node#configuration
  apiVersion: '2022-11-15',
})

export const buffer = async (readable: Readable) => {
  const chunks = []
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

/**
 * Takes a Stripe subscription and populates a Subscription object
 * @param stripeSubscription A stripe subscription
 * @returns Our internal Subscription type
 */
export const remapStripeSubscription = (
  stripeSubscription: Stripe.Subscription
): Partial<Subscription> => {
  const sub: Partial<Subscription> = {}
  for (const key of kSubscriptionFields) {
    const remappedKey = (kRemapFieldsForSubscription[key] ??
      key) as keyof Subscription
    sub[remappedKey] = stripeSubscription[
      key as keyof Stripe.Subscription
    ] as any
  }
  return sub
}

/**
 * Takes a Stripe subscription and populates a Discount object
 * @param stripeSubscription A stripe subscription
 * @returns Our internal SubscriptionDiscount type
 */
export const buildDiscountObject = (
  stripeSubscription: Stripe.Subscription
): PriceDiscount => ({
  id: stripeSubscription.discount?.id,
  name: stripeSubscription.discount?.coupon.name?.toString(),
  start: stripeSubscription.discount?.start,
  end: stripeSubscription.discount?.end,
  percentOff: stripeSubscription.discount?.coupon.percent_off,
  amountOff: stripeSubscription.discount?.coupon.amount_off,
  promotionCode:
    stripeSubscription.discount?.promotion_code?.toString() ?? null,
  valid: stripeSubscription.discount?.coupon.valid,
})

/**
 * Given a Stripe customer and subscription, build a canonical subscription object
 * @param stripeSubscription Stripe subscription object
 * @param stripeCustomer Stripe customer object
 * @returns Our internal Subscription type
 */
export const buildSubscriptionObject = (
  stripeSubscription: Stripe.Subscription,
  stripeCustomer: Stripe.Customer
): Partial<Subscription> => ({
  ...remapStripeSubscription(stripeSubscription),
  price: stripeSubscription.items.data[0].price.unit_amount,
  interval: stripeSubscription.items.data[0].price.recurring?.interval,
  product: stripeSubscription.items.data[0].price.product.toString(),
  balance: stripeCustomer.balance ?? 0,
  customerEmail: stripeCustomer.email,
  discount: buildDiscountObject(stripeSubscription),
})

/**
 * Calculates the retention duration of a subscription based on its trial start and cancellation date.
 *
 * @param {Stripe.Subscription} subscription - Stripe Subscription object.
 * @returns {string} Formatted retention duration (e.g., "x years, y months, z days") or 'n/a' if data is missing.
 */
export const getRetentionDuration = (
  subcription: Stripe.Subscription
): string | undefined => {
  if (!subcription.trial_start || !subcription.canceled_at) {
    return undefined
  }

  const trialStartMillis = subcription.trial_start * 1000
  const canceledAtMillis = subcription.canceled_at * 1000
  const retentionMillis = canceledAtMillis - trialStartMillis

  return formatDuration(retentionMillis)
}

/**
 * Determines the subscription tier based on the product ID.
 *
 * - If the product ID is included in the bloom product IDs, 'bloom' is returned.
 * - If the product ID is included in the lite product IDs, 'lite' is returned.
 * - If the product ID is not included in either, `undefined` is returned.
 *
 * @function determineSubscriptionTier
 * @param {string | undefined | null} productId - The product ID to determine the subscription tier for.
 * @returns {SubscriptionTier | undefined} The subscription tier ('bloom' or 'lite') or `undefined` if the product ID does not match any tier.
 */
export const determineSubscriptionTier = (
  productId: string | undefined | null
): SubscriptionTier | undefined => {
  if (kProductPackages.bloom.productIds.includes(productId ?? '')) {
    return 'bloom'
  } else if (kProductPackages.lite.productIds.includes(productId ?? '')) {
    return 'lite'
  }
  return undefined
}

/**
 * Constructs price string for Subscription page using our internal Subscription object.
 * @param subscription Internal Subscription object
 * @returns string or null
 */
export const buildPriceString = (
  subscription: Partial<Subscription> | undefined
): string | null => {
  if (!subscription?.price || !subscription.interval) {
    return null
  }

  if (subscription?.status === 'trialing') {
    return 'Free trial'
  }

  let price = subscription.price / 100

  const basePriceString = `$${price} / ${subscription.interval}`
  let priceString = basePriceString

  const discountStarted =
    (subscription.discount?.start ?? 0) * 1000 < Date.now()
  const discountEndTimestamp = subscription?.discount?.end
    ? subscription?.discount?.end * 1000
    : null
  const discountEnded =
    discountEndTimestamp && discountEndTimestamp <= Date.now()

  if (discountStarted && !discountEnded) {
    if (subscription?.discount?.amountOff) {
      price = Math.round(price * 100 - subscription.discount.amountOff) / 100 // TODO: This will likely be incorrect for non USD currencies and needs to be investigated
      priceString = `$${price} / ${subscription.interval} ($${
        subscription.discount.amountOff / 100
      } discount applied)`
    } else if (subscription?.discount?.percentOff) {
      price = Math.round(price * subscription.discount.percentOff) / 100
      priceString = `$${price} / ${subscription.interval} (${subscription.discount.percentOff}% discount applied)`
    }
  }
  return priceString
}

/**
 * Constructs discount ends string for Subscription page using our internal Subscription object.
 * @param subscription Internal Subscription object
 * @returns string or null
 */
export const buildDiscountEndsString = (
  subscription: Partial<Subscription> | undefined
): string | null => {
  if (!subscription?.discount?.end || !subscription.price) {
    return null
  }

  const discountEndTimestamp = subscription?.discount?.end
    ? subscription?.discount?.end * 1000
    : null
  if (discountEndTimestamp && discountEndTimestamp > Date.now()) {
    const discountEndDateString =
      moment(discountEndTimestamp).format('MMMM Do, YYYY')
    const priceString = `$${subscription?.price / 100} / ${
      subscription?.interval
    }`
    return `On ${discountEndDateString}, price will become ${priceString}`
  }
  return null
}
