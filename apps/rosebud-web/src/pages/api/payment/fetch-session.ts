import { NextApiRequest, NextApiResponse } from 'next'
import { stripe } from 'util/stripe'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { sessionId } = JSON.parse(req.body)

      if (!sessionId) {
        throw new Error('Please provide a valid Session ID')
      }

      // Create a new Stripe customer with the provided UUID as metadata
      const session = await stripe.checkout.sessions.retrieve(sessionId)

      return res.status(200).json({ response: session })
    } catch (error) {
      console.error(error)
      return res
        .status(500)
        .json({ error: { statusCode: 500, message: error.message } })
    }
  } else {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }
}
