import 'dotenv/config'

import type Stripe from 'stripe'

import logger from '../shared/logger'
import { getCanceledSubscriptionsBreakdown } from '../shared/stripe/getCanceledSubscriptionsBreakdown'
import { getCanceledSubscriptions } from '../shared/stripe/getCanceledSubscriptions'
import { getCancellationDate } from '../shared/stripe/getCancellationDate'

/**
 * Fetching past canceled subscriptions...
 * All past cancelled subs: 354
 * |-> Past cancelled subscriptions: 300
 * |-> Duplicate subscriptions: 54 (15%)
 *
 * Fetching past canceled subscriptions breakdown...
 * Past cancelled subscriptions: 300
 * |-> Trial cancellations: 223 (74%)
 * |-> Subscription cancellations: 77 (26%)
 *
 * Fetching upcoming canceled subscriptions...
 * All upcoming cancelled subs: 94
 * |-> Upcoming cancelled subscriptions: 94
 * |-> Duplicate subscriptions: 0 (0%)
 *
 * Fetching upcoming canceled subscriptions breakdown...
 * Upcoming cancelled subscriptions: 94
 * |-> Trial cancellations: 5 (5%)
 * |-> Subscription cancellations: 89 (95%)
 */

const showCanceledSubscriptionsList = async (
  type: 'past' | 'upcoming',
  canceledSubs: Stripe.Subscription[],
  sortOrder: 'asc' | 'desc' = 'asc',
  displayType: 'console' | 'export' = 'console'
) => {
  if (displayType === 'console') {
    logger.info(`${type.toUpperCase()} Canceled Subscriptions:`)
    logger.info('+---------------------+----------------------+')
    logger.info('| Customer Email      | Cancellation Date   |')
    logger.info('+---------------------+----------------------+')
  }
  // Sort churned subscriptions by cancellation date (most recent first)
  canceledSubs.sort((subA, subB) => {
    const unixTimestampForCanceledDateSubB = Math.floor(
      getCancellationDate(subB).getTime() / 1000
    )

    const unixTimestampForCanceledDateSubA = Math.floor(
      getCancellationDate(subA).getTime() / 1000
    )

    if (sortOrder === 'asc') {
      return unixTimestampForCanceledDateSubB - unixTimestampForCanceledDateSubA
    } else {
      return unixTimestampForCanceledDateSubA - unixTimestampForCanceledDateSubB
    }
  })

  for (const sub of canceledSubs) {
    const customerEmail = (sub.customer as Stripe.Customer)?.email
    const cancellationDate = getCancellationDate(sub).toLocaleDateString()

    if (displayType === 'console') {
      logger.info(`| ${customerEmail} | ${cancellationDate} |`)
    } else {
      logger.info(`${customerEmail},${cancellationDate}`)
    }
  }

  if (displayType === 'console') {
    logger.info('+---------------------+----------------------+')
  }
}

const run = async () => {
  const showPastCancellationStats = true
  const showUpcomingCancellationStats = false

  if (showPastCancellationStats) {
    logger.info('Fetching past canceled subscriptions...')
    // Get all past canceled subscriptions
    const { allCanceledSubs, canceledSubs, duplicateCanceledCount } =
      await getCanceledSubscriptions('past')

    // Calculate the percentage of duplicate canceled subscriptions
    const duplicateCanceledCountPercentage = (
      (duplicateCanceledCount / allCanceledSubs.length) *
      100
    ).toFixed(0)

    logger.info(`All past cancelled subs: ${allCanceledSubs.length}`)
    logger.info(`|-> Past cancelled subscriptions: ${canceledSubs.length}`)
    logger.info(
      `|-> Duplicate subscriptions: ${duplicateCanceledCount} (${duplicateCanceledCountPercentage}%)`
    )

    logger.info('')

    logger.info('Fetching past canceled subscriptions breakdown...')
    // Get the breakdown of canceled subscriptions
    const { subscriptionCancellations, trialCancellations } =
      await getCanceledSubscriptionsBreakdown(canceledSubs)

    const trialCancellationPercentage = (
      (trialCancellations.length / canceledSubs.length) *
      100
    ).toFixed(0)
    const subscriptionCancellationPercentage = (
      (subscriptionCancellations.length / canceledSubs.length) *
      100
    ).toFixed(0)

    logger.info(`Past cancelled subscriptions: ${canceledSubs.length}`)
    logger.info(
      `|-> Trial cancellations: ${trialCancellations.length} (${trialCancellationPercentage}%)`
    )
    logger.info(
      `|-> Subscription cancellations: ${subscriptionCancellations.length} (${subscriptionCancellationPercentage}%)`
    )

    // Show the list of past canceled subscriptions
    // await showCanceledSubscriptionsList('past', canceledSubs, 'asc', 'export')

    logger.info('')
  }

  if (showUpcomingCancellationStats) {
    logger.info('Fetching upcoming canceled subscriptions...')
    // Get all upcoming canceled subscriptions
    const {
      allCanceledSubs: allUpcomingCanceledSubs,
      canceledSubs: upcomingCanceledSubs,
      duplicateCanceledCount: duplicateUpcomingCanceledSubs,
    } = await getCanceledSubscriptions('upcoming')

    // Calculate the percentage of duplicate canceled subscriptions
    const duplicateUpcomingCanceledSubsPercentage = (
      (duplicateUpcomingCanceledSubs / allUpcomingCanceledSubs.length) *
      100
    ).toFixed(0)

    logger.info(
      `All upcoming cancelled subs: ${allUpcomingCanceledSubs.length}`
    )
    logger.info(
      `|-> Upcoming cancelled subscriptions: ${upcomingCanceledSubs.length}`
    )
    logger.info(
      `|-> Duplicate subscriptions: ${duplicateUpcomingCanceledSubs} (${duplicateUpcomingCanceledSubsPercentage}%)`
    )

    logger.info('')

    logger.info('Fetching upcoming canceled subscriptions breakdown...')
    // Get the breakdown of canceled subscriptions
    const {
      subscriptionCancellations: upcomingSubscriptionCancellations,
      trialCancellations: upcomingTrialCancellations,
    } = await getCanceledSubscriptionsBreakdown(upcomingCanceledSubs)

    const upcomingTrialCancellationsPercentage = (
      (upcomingTrialCancellations.length / upcomingCanceledSubs.length) *
      100
    ).toFixed(0)
    const upcomingSubscriptionCancellationsPercentage = (
      (upcomingSubscriptionCancellations.length / upcomingCanceledSubs.length) *
      100
    ).toFixed(0)

    logger.info(
      `Upcoming cancelled subscriptions: ${upcomingCanceledSubs.length}`
    )
    logger.info(
      `|-> Trial cancellations: ${upcomingTrialCancellations.length} (${upcomingTrialCancellationsPercentage}%)`
    )
    logger.info(
      `|-> Subscription cancellations: ${upcomingSubscriptionCancellations.length} (${upcomingSubscriptionCancellationsPercentage}%)`
    )

    // Show the list of upcoming canceled subscriptions
    // await showCanceledSubscriptionsList(
    //   'upcoming',
    //   upcomingCanceledSubs,
    //   'desc',
    //   'export'
    // )
  }
}

run()
