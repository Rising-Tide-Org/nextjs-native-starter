import { kSubscriptionSource } from 'constants/subscriptionSource'
// Stripe docs: https://stripe.com/docs/api/subscriptions/object
export type Subscription = {
  id: string | null // null for when going through stripe flow still
  sessionId: string
  startDate: number | null // null for when going through stripe flow still
  canceledAt: number | null // If the subscription has been canceled, the date of that cancellation.
  cancelAtPeriodEnd: boolean // Boolean indicating whether this subscription should cancel at the end of the current period.
  cancelAt: number | null
  currentPeriodEnd: number | null
  currentPeriodStart: number | null
  customerId: string | null
  customerEmail: string | null
  price?: number | null
  product?: string | null // Stripe product identifier that can be used to determine subscription tier (eg. Bloom, Premium)
  interval?: 'day' | 'week' | 'month' | 'year' | null
  balance?: number | null
  discount?: PriceDiscount
  upgradeSource?: SubscriptionSource | null

  // Taken directly from stipe https://stripe.com/docs/billing/subscriptions/overview#subscription-statuses
  status:
    | 'trialing'
    | 'active'
    | 'incomplete'
    | 'past_due'
    | 'canceled'
    | 'unpaid'
    | 'incomplete_expired'
}

export type PriceDiscount = {
  id?: string | null
  name?: string | null
  start?: number | null
  end?: number | null
  percentOff?: number | null
  amountOff?: number | null
  promotionCode?: string | null
  valid?: boolean | null
}

export type PriceInterval = 'monthly' | 'yearly'

export type SubscriptionTier = 'lite' | 'bloom'

export type PricePackage = {
  id: string
  price: number
  interval: PriceInterval
  tier: SubscriptionTier
  coupon?: string
  couponPrice?: number
}

export type ProductPackages = {
  productIds: string[]
  pricePackages: Record<PriceInterval, PricePackage[]>
}

// Types are defined in constants SubscriptionModalSources.ts
export type SubscriptionSource = (typeof kSubscriptionSource)[number]
