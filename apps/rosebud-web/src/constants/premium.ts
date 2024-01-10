import {
  PricePackage,
  ProductPackages,
  SubscriptionTier,
} from 'types/Subscription'
import { isProd } from 'util/env'

export const kProductPackages: Record<SubscriptionTier, ProductPackages> = {
  bloom: {
    productIds: [
      'prod_Or9lTjtL2vbwtU', // monthly
      'prod_Osdc3PgjwaEr7I', // yearly
      'prod_P0ZEM9U5pIzxVn', // monthly (test)
      'prod_P0YBHL5YYfHpEl', // yearly (test)
    ],
    pricePackages: {
      monthly: [
        {
          id: isProd()
            ? 'price_1OCtgeKLGprJPbftjD2rSPiR'
            : 'price_1OCY6TKLGprJPbftIgU9uvri',
          interval: 'monthly',
          price: 15.99,
          tier: 'bloom',
        },
        {
          id: isProd()
            ? 'price_1ODL4iKLGprJPbftucnleZE7'
            : 'price_1OCtb4KLGprJPbft4mRdKPI2',
          interval: 'monthly',
          price: 12.99,
          tier: 'bloom',
        },
      ],
      yearly: [
        {
          id: isProd()
            ? 'price_1OCtczKLGprJPbftJBvvS0bv'
            : 'price_1ODF9MKLGprJPbftwaIkiNQ9',
          interval: 'yearly',
          price: 153.99,
          tier: 'bloom',
        },
        {
          id: isProd()
            ? 'price_1ODL4SKLGprJPbftVesBxqdc'
            : 'price_1ODL31KLGprJPbftKjHGeEqN',
          interval: 'yearly',
          price: 132.99,
          tier: 'bloom',
        },
      ],
    },
  },
  lite: {
    productIds: [
      'prod_Np0rWlfct3Hb5a', // monthly
      'prod_O8EPwnBJ0AYo5w', // yearly
      'prod_NkXrXIg9N4yLLN', // monthly (test)
      'prod_O8Dvhysh0NEuiX', // yearly (test)
    ],
    pricePackages: {
      monthly: [
        {
          id: isProd()
            ? 'price_1OCtiNKLGprJPbftKYIsSv9T'
            : 'price_1Mz2mEKLGprJPbft7hGLaRCJ',
          interval: 'monthly',
          price: 5.99,
          tier: 'lite',
        },
        {
          id: isProd()
            ? 'price_1N3MpTKLGprJPbftsXMOgNvw'
            : 'price_1ODL29KLGprJPbftQgAO3ORC',
          interval: 'monthly',
          price: 4.99,
          tier: 'lite',
        },
      ],
      yearly: [
        {
          id: isProd()
            ? 'price_1OCtjIKLGprJPbftrhmqQL8N'
            : 'price_1ODL1IKLGprJPbfthyFSTVos',
          interval: 'yearly',
          price: 57.99,
          tier: 'lite',
        },
        {
          id: isProd()
            ? 'price_1NLxx9KLGprJPbftpz5DNJtF'
            : 'price_1NLxTWKLGprJPbftcUhpumRO',
          interval: 'yearly',
          price: 47.99,
          tier: 'lite',
        },
      ],
    },
  },
}

// Rosebud Premium price packages
// TODO: Remove once Bloom and Lite are launched publicly
export const kPricePackages: PricePackage[] = [
  // Monthly
  {
    id: isProd()
      ? 'price_1N3MpTKLGprJPbftsXMOgNvw'
      : 'price_1Mz2mEKLGprJPbft7hGLaRCJ',
    interval: 'monthly',
    price: 4.99,
    tier: 'lite',
  },
  // Yearly
  {
    id: isProd()
      ? 'price_1NLxx9KLGprJPbftpz5DNJtF'
      : 'price_1NLxTWKLGprJPbftcUhpumRO',
    interval: 'yearly',
    price: 47.99,
    tier: 'lite',
  },
]

export const kDefaultPricePackage = kPricePackages[0]

export enum PriceDiscoveryVariant {
  control = 'control',
  noDiscount = 'no-discount',
  withDiscount = 'with-discount',
}

export enum PriceIntervalVariant {
  control = 'control',
  annualOnly = 'annual-only',
}

export const kPremiumLimitForEntries = 7
export const kMaxFreePrompts = 2
export const kMaxFreeWeeklyInsights = 1

// Free trial periods
export const kTrialPeriodDaysForNewUsers = 7

// Stripe specific fields we want to pull off the subscription object
export const kSubscriptionFields = [
  'id',
  'status',
  'start_date',
  'cancel_at_period_end',
  'cancel_at',
  'canceled_at',
  'current_period_end',
  'current_period_start',
  'customer',
]

export const kRemapFieldsForSubscription: Record<string, string> = {
  start_date: 'startDate',
  cancel_at_period_end: 'cancelAtPeriodEnd',
  cancel_at: 'cancelAt',
  canceled_at: 'canceledAt',
  current_period_end: 'currentPeriodEnd',
  current_period_start: 'currentPeriodStart',
  customer: 'customerId',
}
