import 'dotenv/config'

import type Stripe from 'stripe'
import { stripe } from 'util/stripe'
import logger from '../shared/logger'

function removeDuplicates(arr: any[]) {
  return arr.filter((item, index) => arr.indexOf(item) === index)
}

function findDuplicates(arr: any[]) {
  return arr.filter(
    (currentValue, currentIndex) => arr.indexOf(currentValue) !== currentIndex
  )
}

/**
 * Script to find all customers with multiple accounts with the same email.
 * This can be modified in a variety of ways to get other information from stripe.
 * To run this use the following command:
 *
 * yarn tsx scripts/stripe-customer-duplicate-emails.ts
 *
 * NOTE: Make sure that variables in .env correspond to the environment you want to run this script in.
 */
const run = async () => {
  let customers: Stripe.Customer[] = []

  const getCustomers = async (cursorPage: string | null) => {
    if (!cursorPage) return

    const temp = await stripe.customers.search({
      limit: 100,
      page: cursorPage,
      query: '-email:null',
    })

    customers = [...customers, ...temp.data]

    await getCustomers(temp.next_page)
  }

  const firstCustomers = await stripe.customers.search({
    query: '-email:null',
    limit: 100,
  })

  customers = [...firstCustomers.data]

  await getCustomers(firstCustomers.next_page)

  const arr = customers.map((c) => c.email).filter((i) => i)
  const duplicates = removeDuplicates(findDuplicates(arr))

  logger.info(
    `[duplicate-emails] Found ${duplicates.length} customers with duplicate emails.`
  )
  logger.info(`[duplicate-emails] ${duplicates.map((d) => `\n${d}`)}`)
}

run()
