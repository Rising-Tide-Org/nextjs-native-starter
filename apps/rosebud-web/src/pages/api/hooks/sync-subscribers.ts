import { MixpanelUserProps } from 'constants/analytics'
import AnalyticsServer from 'lib/analytics-server'
import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { stripe } from 'util/stripe'

AnalyticsServer.init()

// This does not need to be secret!
const AuthKey = '3b7988f4-fb2b-4a37-bba8-9c4f2eb0394b'

type CustomerMetadata = Stripe.Customer & {
  metadata: {
    uuid: string
    uid: string
  }
}

/**
 * This function syncs the subscription status of all customers in Stripe to matching Mixpanel users.
 * @returns Results of the sync
 */

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { key } = req.query

  // We just need some basic way of making sure this doesn't get accidentally hit
  // by the outside, and only by the webhook.
  if (key !== AuthKey) {
    console.error('[ERROR] Dispatch endpoint being hit without authorization!')
    return res.status(404).end()
  }

  const customers = await getAllCustomers()
  const updated = []
  const missingMetadata = []
  const omitted = []

  for (const customer of customers) {
    const { uuid } = customer.metadata

    if (uuid) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
      })
      customer.subscriptions = subscriptions

      const subscriptionStatus = (() => {
        if (subscriptions?.data?.[0]?.canceled_at) {
          return 'canceled'
        }
        return subscriptions.data?.[0]?.status
      })()

      AnalyticsServer.setUserProps(uuid, {
        [MixpanelUserProps.subscriptionStatus]: subscriptionStatus,
      })
      if (subscriptionStatus === 'canceled') {
        AnalyticsServer.setUserProps(uuid, {
          [MixpanelUserProps.cancellationReason]:
            subscriptions.data?.[0]?.cancellation_details?.reason,
        })
      }
      updated.push({
        id: customer.id,
        uuid,
        status: subscriptionStatus,
      })
    } else {
      if (customer.subscriptions?.data[0]?.status === 'active') {
        missingMetadata.push(customer.id)
      }
      omitted.push(customer.id)
    }
  }

  res.status(200).json({
    updatedCount: updated.length,
    missingMetadataCount: missingMetadata.length,
    omittedCount: omitted.length,
    updated,
    missingMetadata,
  })
}

async function getAllCustomers() {
  const customers: Stripe.Customer[] = []
  let lastCustomerId: string | undefined

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const customerBatch = await stripe.customers.list({
      limit: 100, // get 100 customers at a time
      starting_after: lastCustomerId,
      expand: ['data.subscriptions'],
    })

    customers.push(...customerBatch.data)

    if (!customerBatch.has_more) {
      break
    }

    lastCustomerId = customers[customers.length - 1].id
  }

  return customers as CustomerMetadata[]
}

export default handler
