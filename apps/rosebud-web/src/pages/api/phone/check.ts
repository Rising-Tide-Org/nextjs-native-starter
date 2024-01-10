import { NextApiRequest, NextApiResponse } from 'next'
import { twilio, TwilioVerificationServiceId } from '../../../lib/twilio'
import { captureException as sentryCaptureException } from '@sentry/nextjs'
import withMiddleware from 'middleware'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { to } = JSON.parse(req.body)

    if (!to) {
      return res.status(400).json({ error: 'Incorrect input' })
    }

    if (!TwilioVerificationServiceId) {
      return res.status(500).json({ error: 'Missing credentials' })
    }

    const resp = await twilio.verify.v2
      .services(TwilioVerificationServiceId)
      .verifications.create({ to, channel: 'sms' })

    if (resp.status === 'pending') {
      return res.status(201).json({})
    }

    return res.status(404).json({
      error: {
        message: 'Not found.',
      },
    })
  } catch (error) {
    sentryCaptureException(error)
    return res.status(500).json({ error: { message: 'Internal error' } })
  }
}

export default withMiddleware({
  methods: ['POST'],
  authenticated: true,
})(handler)
