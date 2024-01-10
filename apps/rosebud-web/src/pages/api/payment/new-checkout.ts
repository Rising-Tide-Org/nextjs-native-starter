import { kTrialPeriodDaysForNewUsers } from 'constants/premium'
import { NextApiRequest, NextApiResponse } from 'next'
import withMiddleware from 'middleware'
import { stripe } from 'util/stripe'
import navigator from 'lib/routes'

const defaultReturnUrl = navigator.subscription

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    customerId,
    priceId,
    returnUrl = defaultReturnUrl,
    cancelUrl = defaultReturnUrl,
    coupon,
  } = JSON.parse(req.body)
  const baseUrl = `${req.headers.origin}`

  const successUrl = `${baseUrl}${returnUrl}${
    returnUrl.includes('?') ? '&' : '/?'
  }payment_id={CHECKOUT_SESSION_ID}`

  try {
    const endedPastSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'ended',
      limit: 1,
    })

    let trialPeriodDays: number | undefined = kTrialPeriodDaysForNewUsers
    if (endedPastSubscriptions.data.length > 0) {
      trialPeriodDays = undefined
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // Stripe only allows either allow_promotion_codes or discounts to be present, not both
      ...(!coupon && { allow_promotion_codes: false }), // Enables user redeemable promotion codes
      ...(coupon && { discounts: [{ coupon }] }), // Auto applies coupon to checkout session
      subscription_data: {
        trial_period_days: trialPeriodDays,
      },
      custom_fields: [
        // When adding fields here, make sure to update these in stripe webhook and MixpanelUserProps
        {
          key: 'referringPlatform',
          label: {
            type: 'custom',
            custom: 'How did you hear about Rosebud?',
          },
          optional: true,
          type: 'dropdown',
          dropdown: {
            options: [
              {
                label: 'Google',
                value: 'google',
              },
              {
                label: 'Instagram',
                value: 'instagram',
              },
              {
                label: 'Newsletter',
                value: 'newsletter',
              },
              {
                label: 'Podcast',
                value: 'podcast',
              },
              {
                label: 'Product Hunt',
                value: 'productHunt',
              },
              {
                label: 'Referral',
                value: 'referral',
              },
              {
                label: 'TikTok',
                value: 'tiktok',
              },
              {
                label: 'Twitter',
                value: 'twitter',
              },
              {
                label: 'Youtube',
                value: 'youtube',
              },
              {
                label: 'Other',
                value: 'other',
              },
            ],
          },
        },
      ],
      success_url: successUrl,
      cancel_url: `${baseUrl}${cancelUrl}`,
      customer: customerId,
    })

    res.status(200).json({ response: { sessionId: session.id } })
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ error: { statusCode: 500, message: error.message } })
  }
}

export default withMiddleware({
  methods: ['POST'],
  authenticated: true,
})(handler)
