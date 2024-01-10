import 'dotenv/config'

import type Stripe from 'stripe'
import { stripe } from 'util/stripe'

// Store subscriptions across pagination calls
let subs: Stripe.Subscription[] = []

/**
 * Retrieves paginated subscriptions based on the provided status and cursor.
 *
 * @param status - The status of the subscriptions to retrieve.
 * @param cursorPage - The cursor page for pagination (optional).
 * @returns The array of subscriptions.
 */
export const getPaginatedSubscriptions = async (
  status: Stripe.SubscriptionListParams.Status,
  cursorPage?: string | false
): Promise<Stripe.Subscription[]> => {
  let cursor = cursorPage

  // Fetch the first page of subscriptions if cursor is false
  if (cursor === false) {
    const subscriptionsFirstCall = await stripe.subscriptions.list({
      status: status,
      expand: ['data.customer'],
      limit: 100,
    })

    // Update cursor and store subscriptions
    cursor = subscriptionsFirstCall.data.at(-1)?.id
    subs = [...subs, ...subscriptionsFirstCall.data]
  }

  // Early return if no cursor
  if (!cursor) {
    const subsForReturn = [...subs]
    subs = []
    return subsForReturn
  }

  // Fetch next page of subscriptions
  const temp = await stripe.subscriptions.list({
    status,
    expand: ['data.customer'],
    starting_after: cursor,
    limit: 100,
  })

  // Early return if no data
  if (!temp.data.length) {
    const subsForReturn = [...subs]
    subs = []
    return subsForReturn
  }

  // Update cursor and store subscriptions
  subs = [...subs, ...temp.data]

  // Recursive call for fetching next pages
  return await getPaginatedSubscriptions(status, subs.at(-1)?.id)
}
