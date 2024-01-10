import Analytics from 'lib/analytics-server'
import { sendNotification } from 'lib/onesignal'
import { NextApiResponse } from 'next'
import withMiddleware from 'middleware'
import { twilio, TwilioVerificationServiceId } from '../../../lib/twilio'
import { NextAuthApiRequest } from 'middleware/tokenVerification'

const handler = async (req: NextAuthApiRequest, res: NextApiResponse) => {
  try {
    const { to, code } = JSON.parse(req.body)

    if (!to || !code || String(code).length < 4) {
      return res.status(400).json({ error: 'Incorrect input.' })
    }

    if (!TwilioVerificationServiceId) {
      return res.status(500).json({ error: 'Missing credentials' })
    }

    const resp = await twilio.verify.v2
      .services(TwilioVerificationServiceId)
      .verificationChecks.create({ to, code })

    if (resp.status !== 'approved') {
      return res
        .status(401)
        .json({ error: { message: 'Incorrect code', code: 'incorrect' } })
    }

    // This is a supportive flow to send a welcome message to user through OneSignal,
    // and ensure that their profile is created
    try {
      const user = req._user!

      if (user.id) {
        // When user verified phone, send them one time welcoming SMS
        await sendNotification({
          eventName: 'phone-verified',
          content: `You are now subscribed to receive daily reminders from Rosebud 🌹\n\nYou can reach our team at support@rosebud.app\n\nMessage and data rates may apply. Reply STOP to unsubscribe.
      `,
          phoneNumbers: [to],
        })
      }
      // We specifically isolating this flow to not interrupt user phone verification experience
    } catch (error) {
      console.error(error)
      Analytics.trackEvent('', 'onesignal.phone.verification.error', {
        error: error?.message,
      })
    }

    return res.status(200).json({})
  } catch (error) {
    if (error?.status && error?.status === 404) {
      return res
        .status(401)
        .json({ error: { message: 'Incorrect code', code: 'incorrect' } })
    }

    console.error(error?.status)
    return res
      .status(500)
      .json({ error: { message: 'Internal error', code: 'internal_error' } })
  }
}

export default withMiddleware({
  methods: ['POST'],
  authenticated: true,
})(handler)
