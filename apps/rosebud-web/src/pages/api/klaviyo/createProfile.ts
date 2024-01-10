import { captureException as sentryCaptureException } from '@sentry/nextjs'
import { NextApiResponse } from 'next'
import withMiddleware from 'middleware'
import { NextAuthApiRequest } from 'middleware/tokenVerification'
import { Klaviyo } from 'lib/klaviyo'

const handler = async (req: NextAuthApiRequest, res: NextApiResponse) => {
  try {
    const { email } = JSON.parse(req.body)
    const user = {
      ...req._user!,
      email,
    }

    const resp = await Klaviyo.subscribeUserToList(
      email,
      Klaviyo.kListIds.Subscribers,
      'New Profile',
      user
    )

    return res.status(resp?.status ?? 500).json({})
  } catch (error) {
    sentryCaptureException(error)
    return res.status(500).json({ error: { message: 'Internal error' } })
  }
}

export default withMiddleware({
  methods: ['POST'],
  authenticated: true,
})(handler)
