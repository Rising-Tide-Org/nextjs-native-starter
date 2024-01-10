import type Stripe from 'stripe'
import { SubscriptionWithPlan } from 'types/Stripe'
import logger from '../logger'

export const getIntervalBreakdownForSubs = async (
  subscriptions: Stripe.Subscription[]
) => {
  // Initialize counters for subscription intervals
  let monthlySubsCount = 0
  let yearlySubsCount = 0

  // Count the active subscriptions based on their interval (month/year)
  for (const sub of subscriptions) {
    const interval = (sub as SubscriptionWithPlan).plan.interval as
      | 'month'
      | 'year'

    // Increment the corresponding counter
    if (interval === 'month') {
      monthlySubsCount++
    } else if (interval === 'year') {
      yearlySubsCount++
    }
  }

  // Calculate the percentage of monthly subscriptions percentage
  const monthlySubsPercentage = (monthlySubsCount / subscriptions.length) * 100
  const monthlySubsPercentageRounded = monthlySubsPercentage.toFixed(2)

  // Calculate the percentage of yearly subscriptions percentage
  const yearlySubsPercentage = (yearlySubsCount / subscriptions.length) * 100
  const yearlySubsPercentageRounded = yearlySubsPercentage.toFixed(2)

  // Log the subscription stats by interval with percentage
  logger.info(
    `Monthly: ${monthlySubsCount} (${monthlySubsPercentageRounded}%) | Yearly: ${yearlySubsCount} (${yearlySubsPercentageRounded}%)`
  )
}
