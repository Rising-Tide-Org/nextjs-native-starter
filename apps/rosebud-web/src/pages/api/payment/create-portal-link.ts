import { NextApiRequest, NextApiResponse } from 'next'
import withMiddleware from 'middleware'
import { stripe } from 'util/stripe'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { customerId, subscriptionId, returnPath } = JSON.parse(req.body)
    const baseUrl = `${req.headers.origin}`

    if (!customerId && !subscriptionId) {
      throw Error(
        'Need a valid customer or subscription id to create portal link'
      )
    }

    // At the start we have only customer id, later rely solemnly on subscription id, to avoid
    // issues with expired sessions
    let customer: string | undefined
    if (customerId) {
      customer = customerId
    } else {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      customer = subscription.customer as string
    }

    if (!customer) {
      throw Error(
        `Can not retrieve customer id from ${
          subscriptionId ? 'subscription' : 'session'
        }`
      )
    }

    const { url } = await stripe.billingPortal.sessions.create({
      customer: customer as string,
      return_url: `${baseUrl}${returnPath ?? '/subscription'}`,
    })

    return res.status(200).json({ response: { url } })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: { statusCode: 500, message: error.message } })
  }
}

export default withMiddleware({
  methods: ['POST'],
  authenticated: true,
})(handler)
