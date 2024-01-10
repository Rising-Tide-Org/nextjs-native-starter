import 'dotenv/config'

import type Stripe from 'stripe'
import { stripe } from 'util/stripe'
import logger from '../shared/logger'
import { getPaginatedSubscriptions } from '../shared/stripe/getPaginatedSubscriptions'
import { getEndOfWeek, getFollowingMonday } from 'util/date'

/*
Total Churned Subscriptions: 172
Past: 96
Upcoming: 76

// Show the date when the user initiated the cancellation
+---------+--------------+
| Date    | Churned Users |
+---------+--------------+
| 2023-06-05 | 1           |
| 2023-06-12 | 2           |
| 2023-06-19 | 3           |
| 2023-06-26 | 2           |
| 2023-07-03 | 2           |
| 2023-07-10 | 4           |
| 2023-07-17 | 5           |
| 2023-07-24 | 9           |
| 2023-07-31 | 9           |
| 2023-08-07 | 43          |
| 2023-08-14 | 30          |
| 2023-08-21 | 45          |
|---------|--------------|
| 2023-08-28 | 17          |
+---------+--------------+

// Show the date when a users subscription was or will be canceled
+---------+--------------+
| Date    | Churned Users |
+---------+--------------+
| 2023-06-19 | 1           |
| 2023-06-26 | 1           |
| 2023-07-03 | 2           |
| 2023-07-10 | 2           |
| 2023-07-17 | 4           |
| 2023-07-24 | 9           |
| 2023-07-31 | 7           |
| 2023-08-07 | 16          |
| 2023-08-14 | 14          |
| 2023-08-21 | 36          |
|---------|--------------|
| 2023-08-28 | 6           |
| 2023-09-04 | 25          |
| 2023-09-11 | 29          |
| 2023-09-18 | 9           |
| 2023-09-25 | 2           |
| 2024-07-22 | 1           |
| 2024-07-29 | 1           |
| 2024-08-05 | 4           |
| 2024-08-12 | 2           |
| 2024-08-19 | 1           |
+---------+--------------+
*/

const groupByEndOfWeek = (subscriptions: Stripe.Subscription[]) => {
  const grouped: { [endOfWeek: string]: Stripe.Subscription[] } = {}

  for (const sub of subscriptions) {
    let canceledDate = null

    if (sub.cancel_at) {
      // This shows the date the subscription has been canceled
      canceledDate = new Date(sub.cancel_at * 1000)
    } else if (sub.canceled_at) {
      // This shows the date in the future at which the subscription will automatically get canceled
      canceledDate = new Date(sub.canceled_at * 1000)
    }

    if (!canceledDate) {
      continue
    }

    const endOfWeek = getEndOfWeek(canceledDate).toISOString().split('T')[0] // We only want the date part

    if (!grouped[endOfWeek]) {
      grouped[endOfWeek] = []
    }
    grouped[endOfWeek].push(sub)
  }

  return grouped
}

const getPastChurnedSubscriptions = async (): Promise<
  Stripe.Subscription[]
> => {
  const canceledSubs = await getPaginatedSubscriptions('canceled', false)

  // Filter churned subscriptions with at least one successful payment
  const churnedSubs: Stripe.Subscription[] = []
  for (const sub of canceledSubs) {
    const customer = sub.customer as Stripe.Customer

    try {
      // Fetch the payment history for the customer
      const paymentIntents = await stripe.paymentIntents.list({
        customer: customer.id,
      })

      // Check if the customer has successful payments
      const hasSuccessfulPayment = paymentIntents.data.some(
        (payment) => payment.status === 'succeeded'
      )

      if (hasSuccessfulPayment) {
        churnedSubs.push(sub)
      }
    } catch (error) {
      console.error(
        `Error fetching payment history for customer ${customer.id}`
      )
    }
  }

  // Sort churned subscriptions by cancellation date (most recent first)
  churnedSubs.sort(
    (subA, subB) => (subB.canceled_at || 0) - (subA.canceled_at || 0)
  )

  return churnedSubs
}

const getUpcomingChurnedSubscriptions = async (): Promise<
  Stripe.Subscription[]
> => {
  const activeSubs = await getPaginatedSubscriptions('active', false)

  // Filter upcoming churned subscriptions (active subscriptions with a future canceled_at date)
  const upcomingChurnedSubs: Stripe.Subscription[] = []
  for (const sub of activeSubs) {
    if (sub.cancel_at && sub.cancel_at > Math.floor(Date.now() / 1000)) {
      upcomingChurnedSubs.push(sub)
    }
  }

  // Sort churned subscriptions by cancellation date (most recent first)
  upcomingChurnedSubs.sort(
    (subA, subB) => (subA.cancel_at || 0) - (subB.cancel_at || 0)
  )

  return upcomingChurnedSubs
}

const showChurnedUsersByWeek = async () => {
  const pastChurnedSubs = await getPastChurnedSubscriptions()
  const upcomingChurnedSubs = await getUpcomingChurnedSubscriptions()
  const groupedSubs = groupByEndOfWeek([
    ...pastChurnedSubs,
    ...upcomingChurnedSubs,
  ])

  const today = new Date().toISOString().split('T')[0]

  logger.info(
    `Total Churned Subscriptions: ${Object.keys(groupedSubs).reduce(
      (acc, key) => acc + groupedSubs[key].length,
      0
    )}`
  )
  logger.info(`Past: ${pastChurnedSubs.length}`)
  logger.info(`Upcoming: ${upcomingChurnedSubs.length}`)

  logger.info('+---------+--------------+')
  logger.info('| Date    | Churned Users |')
  logger.info('+---------+--------------+')

  let addedTodaySeparator = false

  const sortedWeeks = Object.keys(groupedSubs).sort() // Sorting the weeks

  for (const sunday of sortedWeeks) {
    const weeklyCancellations = groupedSubs[sunday].length
    const followingMonday = getFollowingMonday(new Date(sunday))
      .toISOString()
      .split('T')[0]

    if (!addedTodaySeparator && followingMonday > today) {
      logger.info('|---------|--------------|')
      addedTodaySeparator = true
    }

    logger.info(
      `| ${followingMonday} | ${weeklyCancellations.toString().padEnd(12)}|`
    )
  }

  logger.info('+---------+--------------+')
}

showChurnedUsersByWeek()
