import 'dotenv/config'

import type Stripe from 'stripe'
import { stripe } from 'util/stripe'
import logger from '../shared/logger'
import { getPaginatedSubscriptions } from '../shared/stripe/getPaginatedSubscriptions'

/**
 * Script to find all customers that have 2 or more active or trialing subscriptions.
 * To run this use the following command:
 *
 * yarn tsx scripts/stripe-customer-double-subscription.ts
 *
 * NOTE: Make sure that variables in .env correspond to the environment you want to run this script in.
 */
const run = async () => {
  const activeSubs = await getPaginatedSubscriptions('active', false)
  const trialingSubs = await getPaginatedSubscriptions('trialing', false)

  const subscriptions = [...(trialingSubs || []), ...(activeSubs || [])]

  logger.info(
    `[double-subscriptions] Found ${subscriptions.length} subscriptions`
  )

  // Organize subscriptions by customer ID
  const subscriptionsByCustomer: Record<string, Stripe.Subscription[]> = {}
  subscriptions.forEach((subscription) => {
    const customerID = (subscription.customer as Stripe.Customer)?.id
    if (!subscriptionsByCustomer[customerID]) {
      subscriptionsByCustomer[customerID] = []
    }
    subscriptionsByCustomer[customerID].push(subscription)
  })

  // Find customers with at least 2 subscriptions
  const eligibleCustomers: string[] = []
  for (const [customerID, customerSubscriptions] of Object.entries(
    subscriptionsByCustomer
  )) {
    if (customerSubscriptions.length >= 2) {
      eligibleCustomers.push(customerID)
    }
  }

  // Retrieve customer details for eligible customers
  const eligibleCustomerDetails: { e: string | null; id: string }[] = []
  for (const customerID of eligibleCustomers) {
    const customer = (await stripe.customers.retrieve(
      customerID
    )) as Stripe.Customer
    eligibleCustomerDetails.push({
      e: customer?.email,
      id: customer?.id,
    })
  }

  // Now you have a list of customer details who have at least 2 active or trialing subscriptions
  logger.info(
    `[double-subscriptions] Found ${
      eligibleCustomerDetails.length
    } customers with at least 2 subscriptions with status active or trialing.
    ${eligibleCustomerDetails.map((d) => `\n${d.e} - ${d.id}`)}`
  )
}

run()
