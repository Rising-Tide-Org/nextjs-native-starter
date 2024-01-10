import 'dotenv/config'

import type Stripe from 'stripe'
import logger from '../shared/logger'
import { sendCanceledSubscriptionDripEvent } from '../shared/klaviyo/sendCanceledSubscriptionDripEvent'
import { shuffleArray } from 'util/list'
import { getCanceledSubscriptions } from '../shared/stripe/getCanceledSubscriptions'
import { getCanceledSubscriptionsBreakdown } from '../shared/stripe/getCanceledSubscriptionsBreakdown'
import { SubscriptionWithPlan } from 'types/Stripe'

type Customer = {
  email: string
  subType: string
  subInterval: string
}

const kDebug = true

const transformSubcriptionToCustomer = (
  sub: SubscriptionWithPlan,
  subType: string
): Customer => {
  const email = (sub.customer as Stripe.Customer)?.email

  let subInterval = 'notset'
  if (sub.plan.interval === 'month') {
    subInterval = 'M'
  } else if (sub.plan.interval === 'year') {
    subInterval = 'Y'
  }

  return {
    email: email || 'notset',
    subType,
    subInterval,
  }
}

// Function to send emails with logging
const sendEmailsToCohort = async (cohort: Customer[], cohortName: string) => {
  logger.info(`Sending emails to ${cohortName} cohort (${cohort.length})`)

  for (const customer of cohort) {
    try {
      if (kDebug) {
        logger.info(
          `Sending email to: ${customer.email} | ${customer.subType} | ${customer.subInterval}`
        )
      } else {
        await sendCanceledSubscriptionDripEvent(customer.email)
        logger.info(customer.email)
      }
    } catch (error) {
      logger.error(`Failed to send email to ${customer.email}:`, error)
    }
  }

  logger.info('')
}

const run = async () => {
  logger.info('Fetching past canceled subscriptions...')
  // Get all past canceled subscriptions
  const { canceledSubs } = await getCanceledSubscriptions('past')
  // Get the breakdown of past canceled subscriptions
  const {
    subscriptionCancellations: pastSubscriptionCancellations,
    trialCancellations: pastTrialCancellations,
  } = await getCanceledSubscriptionsBreakdown(canceledSubs)
  logger.info(`All past cancelled subs: ${canceledSubs.length}`)
  logger.info(
    `|-> Past cancelled subscriptions: ${pastSubscriptionCancellations.length}`
  )
  logger.info(`|-> Past canceled trials: ${pastTrialCancellations.length}`)

  logger.info('')

  logger.info('Fetching upcoming canceled subscriptions...')
  // Get all upcoming canceled subscriptions
  const { canceledSubs: upcomingCanceledSubs } = await getCanceledSubscriptions(
    'upcoming'
  )
  // Get the breakdown of upcoming canceled subscriptions
  const {
    subscriptionCancellations: upcomingSubscriptionCancellations,
    trialCancellations: upcomingTrialCancellations,
  } = await getCanceledSubscriptionsBreakdown(upcomingCanceledSubs)
  logger.info(`All upcoming cancelled subs: ${upcomingCanceledSubs.length}`)
  logger.info(
    `|-> Upcoming cancelled subscriptions: ${upcomingSubscriptionCancellations.length}`
  )
  logger.info(
    `|-> Upcoming canceled trials: ${upcomingTrialCancellations.length}`
  )

  logger.info('')

  // Add past trial cancellations to all trial cancellations
  const pastTrialCancellationsCustomers = pastTrialCancellations.map((sub) =>
    transformSubcriptionToCustomer(
      sub as SubscriptionWithPlan,
      'trial_canceled'
    )
  )

  // Add upcoming trial cancellations to all trial cancellations
  const upcomingTrialCancellationsCustomers = upcomingTrialCancellations.map(
    (sub) =>
      transformSubcriptionToCustomer(
        sub as SubscriptionWithPlan,
        'trial_canceled'
      )
  )

  // Combine all trial cancellations
  const allTrialCancellations = [
    ...pastTrialCancellationsCustomers,
    ...upcomingTrialCancellationsCustomers,
  ]

  // Add past subscription cancellations to all subscription cancellations
  const pastSubscriptionCancellationsCustomers =
    pastSubscriptionCancellations.map((sub) =>
      transformSubcriptionToCustomer(
        sub as SubscriptionWithPlan,
        'subscription_canceled'
      )
    )

  // Add upcoming subscription cancellations to all subscription cancellations
  const upcomingSubscriptionCancellationsCustomers =
    upcomingSubscriptionCancellations.map((sub) =>
      transformSubcriptionToCustomer(
        sub as SubscriptionWithPlan,
        'subscription_canceled'
      )
    )

  const allSubscriptionCancellations = [
    ...pastSubscriptionCancellationsCustomers,
    ...upcomingSubscriptionCancellationsCustomers,
  ]

  // Shuffle the arrays
  const shuffledTrials = shuffleArray(allTrialCancellations)
  const shuffledSubscriptions = shuffleArray(allSubscriptionCancellations)

  // Only for Phase 2
  const phase1Sent: string[] = []

  const filteredTrials = shuffledTrials.filter(
    (sub) => !phase1Sent.includes(sub.email)
  )
  const filteredSubscriptions = shuffledSubscriptions.filter(
    (sub) => !phase1Sent.includes(sub.email)
  )

  logger.info(`Trials cohort: ${shuffledTrials.length}`)
  logger.info(`Phase 2: ${filteredTrials.length}`)

  logger.info(`Subscriptions cohort: ${shuffledSubscriptions.length}`)
  logger.info(`Phase 2: ${filteredSubscriptions.length}`)

  // Send emails to cohorts
  await sendEmailsToCohort(filteredTrials, 'Trial Cancelled')
  await sendEmailsToCohort(filteredSubscriptions, 'Subscription Cancelled')
}

run().catch((error) =>
  logger.error('Failed to run send-exit-survey-emails script:', error)
)
