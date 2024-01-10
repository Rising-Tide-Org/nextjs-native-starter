import { NextApiResponse } from 'next'
import withMiddleware from 'middleware'
import { NextAuthApiRequest } from 'middleware/tokenVerification'
import { stripe } from 'util/stripe'

const handler = async (req: NextAuthApiRequest, res: NextApiResponse) => {
  try {
    const user = req._user!
    const uuid = user.uuid
    const uid = user.id
    const { upgradeSource } = JSON.parse(req.body)
    const utmParams = JSON.parse(req.body)?.utmParams || {}

    if (!uuid || !uid) {
      throw new Error(
        'Need a valid UUID and UID to create a new Stripe customer'
      )
    }

    // Create a new Stripe customer with the provided UUID as metadata
    const customer = await stripe.customers.create({
      metadata: {
        uuid,
        uid,
        upgradeSource,
        ...utmParams,
      },
    })

    return res.status(200).json({ response: customer.id })
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json({ error: { statusCode: 500, message: error.message } })
  }
}

export default withMiddleware({
  methods: ['POST'],
  authenticated: true,
})(handler)
