import type Stripe from 'stripe'

export type ExpectedEventObjectType = {
  amount_received?: number
  invoice?: string
  billing_reason?: string
  customer?: string
  type?: string
  cancel_at_period_end?: boolean
  payment_intent?: string
  cancellation_details?: {
    reason: string
    feedback?: string
  }
}

export type CustomerWithMetadata = (
  | Stripe.Customer
  | Stripe.DeletedCustomer
) & {
  metadata: {
    uuid: string
    uid: string
    utm_campaign?: string
    utm_source?: string
    utm_medium?: string
    utm_term?: string
    utm_content?: string
  }
}

/**
 * Represents a subscription with associated plan information.
 */
export type SubscriptionWithPlan = {
  /** The plan associated with the subscription. */
  plan: Stripe.Plan
} & Stripe.Subscription

export type PreviousAttributes = Partial<Stripe.Subscription> & {
  cancel_at_period_end?: boolean
}
