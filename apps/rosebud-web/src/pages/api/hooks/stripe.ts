import { NextApiRequest, NextApiResponse } from 'next'
import type Stripe from 'stripe'
import { buffer, buildSubscriptionObject, stripe } from 'util/stripe'
import Cors from 'micro-cors'
import Analytics from 'lib/analytics-server'
import { initializeAdmin } from 'db-server'
import { User } from 'types/User'
import { kDefaultPricePackage } from 'constants/premium'
import { ReferralConversionStage } from 'constants/referral'
import { MixpanelUserProps } from 'constants/analytics'
import {
  ExpectedEventObjectType,
  CustomerWithMetadata,
  SubscriptionWithPlan,
  PreviousAttributes,
} from 'types/Stripe'
import { fetchGroup, fetchOne } from 'db-server/fetch'
import { Referral } from 'types/Referral'
import { updateRecord } from 'db-server/mutate'
import { logSlackMessage } from 'lib/slack'

// Initialize Analytics
Analytics.init()

const cors = Cors({
  allowMethods: ['POST', 'HEAD'],
})

// Picking monthly default price package price id
const referralCreditPriceId = kDefaultPricePackage.id // TODO: Remove this and use $5-flat credit

// Get the Stripe webhook secret from the environment variables
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

// Stripe requires the raw body to construct the event.
export const config = {
  api: {
    bodyParser: false,
  },
}

// The Stripe webhook events that we want to handle
const relevantEvents = new Set([
  'payment_intent.succeeded',
  'invoice.payment_failed',
  'customer.subscription.created',
  'customer.subscription.deleted',
  'customer.subscription.updated',
])

// Read docs/stripe-subscriptions.md for more information
const webhookHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const buf = await buffer(req)
    const sig = req.headers['stripe-signature']
    let event: Stripe.Event
    const app = await initializeAdmin()
    const db = await app.firestore()

    try {
      if (!sig || !webhookSecret) {
        const errorMessage = 'Missing Stripe signature or webhook secret'
        logSlackMessage('stripe-webhook', errorMessage, 'error')
        throw new Error(errorMessage)
      }

      event = stripe.webhooks.constructEvent(buf.toString(), sig, webhookSecret)
    } catch (error) {
      logSlackMessage('stripe-webhook', error.message, 'error')

      return res.status(400).send('Webhook error: ' + error.message)
    }

    if (relevantEvents.has(event.type)) {
      try {
        switch (event.type) {
          /**
           * Occurs when a PaymentIntent has successfully completed payment.
           * Docs: https://stripe.com/docs/api/events/types#event_types-payment_intent.succeeded
           */
          case 'payment_intent.succeeded': {
            const eventObject = event.data.object as ExpectedEventObjectType
            const customerId = eventObject?.customer
            const { uid, uuid } = await getCustomerMetadata(customerId)
            if (!uuid) {
              throw new Error(
                'customer missing uuid for payment_intent.succeeded'
              )
            }

            const eventProps = {
              amount: eventObject?.amount_received,
              reason: null as Stripe.Invoice.BillingReason | null,
              customerId,
            }

            if (eventObject?.invoice) {
              // retrieve invoice from stripe and get the billing reason
              const invoice = await stripe.invoices.retrieve(
                eventObject.invoice
              )
              eventProps.reason = invoice.billing_reason
            }

            // TODO: get this dynamically from Stripe subscription object
            Analytics.setUserProps(uuid, {
              [MixpanelUserProps.subscriptionStatus]: 'active',
            })
            Analytics.trackEvent(
              uuid,
              'subscription.payment.success',
              eventProps
            )
            Analytics.trackUserCharge(
              uuid,
              eventProps.amount as number,
              eventProps
            )

            // If user database id is defined, complete referral conversion
            if (uid) {
              try {
                await completeReferralConversion(db, uid, uuid)
              } catch (err) {
                Analytics.trackEvent(uuid, 'referral.stage.error', {
                  error: err.message,
                })
              }
            }
            break
          }

          /**
           * Occurs whenever a customer is signed up for a new plan.
           * Docs: https://stripe.com/docs/api/events/types#event_types-customer.subscription.created
           */
          case 'customer.subscription.created': {
            const subscription = event.data.object as SubscriptionWithPlan
            const customer = (await stripe.customers.retrieve(
              subscription.customer as string
            )) as unknown as CustomerWithMetadata

            const { uuid, uid } = customer.metadata ?? {}
            if (!uuid || !uid) {
              throw new Error(
                'customer missing uuid or uid for customer.subscription.created'
              )
            }

            const sessions = await stripe.checkout.sessions.list({
              subscription: subscription.id,
            })

            if (sessions.data.length) {
              const referringPlatform = sessions.data[0].custom_fields.find(
                (customField) => customField.key === 'referringPlatform'
              )

              if (referringPlatform?.dropdown?.value) {
                Analytics.setUserProps(uuid, {
                  [MixpanelUserProps.referringPlatform]:
                    referringPlatform.dropdown?.value,
                })
              }
            }

            // When a subscription is created (i.e a trial is started),
            // update the subscription object for the user for certainty
            await updateRecord<User>(db, 'users', uid, {
              userId: uid,
              data: {
                subscription: buildSubscriptionObject(
                  subscription,
                  customer as Stripe.Customer
                ),
              },
            })

            Analytics.trackEvent(uuid, 'subscription.created', {
              amount: subscription.plan.amount,
              interval: subscription.plan.interval,
              customerId: subscription.customer.toString(),
            })
            Analytics.setUserProps(uuid, {
              [MixpanelUserProps.subscriptionStatus]: subscription.status,
            })
            break
          }

          /**
           * Occurs whenever an invoice payment attempt fails,
           * due either to a declined payment or to the lack of a stored payment method.
           * Docs: https://stripe.com/docs/api/events/types#event_types-invoice.payment_failed
           */
          case 'invoice.payment_failed': {
            const eventObject = event.data.object as ExpectedEventObjectType
            const { uuid } = await getCustomerMetadata(eventObject?.customer)
            if (!uuid) {
              throw new Error(
                'customer missing uuid for invoice.payment_failed'
              )
            }

            const eventProps = {
              reason: eventObject.billing_reason,
              customerId: eventObject.customer,
              code: undefined as string | undefined,
              message: undefined as string | undefined,
              declineCode: undefined as string | undefined,
            }

            if (eventObject?.payment_intent) {
              // retrieve invoice from stripe and get the billing reason
              const intent = await stripe.paymentIntents.retrieve(
                eventObject.payment_intent
              )

              if (intent?.last_payment_error?.code) {
                eventProps.code = intent.last_payment_error.code
                eventProps.message = intent.last_payment_error.message
                eventProps.declineCode = intent.last_payment_error.decline_code
              }
            }

            // TODO: get this dynamically from Stripe subscription object
            Analytics.setUserProps(uuid, {
              [MixpanelUserProps.subscriptionStatus]: 'past_due',
            })
            Analytics.trackEvent(
              uuid,
              'subscription.payment.failed',
              eventProps
            )
            break
          }

          /**
           * Occurs whenever a customer’s subscription ends.
           * Docs: https://stripe.com/docs/api/events/types#event_types-customer.subscription.deleted
           */
          case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription
            const { uuid } = await getCustomerMetadata(
              subscription.customer.toString()
            )
            if (!uuid) {
              throw new Error(
                'customer missing uuid for customer.subscription.deleted'
              )
            }

            Analytics.setUserProps(uuid, {
              [MixpanelUserProps.subscriptionStatus]: subscription.status,
              [MixpanelUserProps.cancellationReason]:
                subscription.cancellation_details?.reason,
              [MixpanelUserProps.cancellationFeedback]:
                subscription.cancellation_details?.feedback,
              [MixpanelUserProps.cancellationComment]:
                subscription.cancellation_details?.comment,
            })
            Analytics.trackEvent(uuid, 'subscription.deleted', {
              customerId: subscription.customer,
              reason: subscription?.cancellation_details?.reason,
              feedback: subscription?.cancellation_details?.feedback,
              comment: subscription?.cancellation_details?.comment,
            })
            break
          }

          /**
           * Triggered when a subscription is updated
           * Docs: https://stripe.com/docs/api/events/types?lang=node#event_types-customer.subscription.updated
           */
          case 'customer.subscription.updated': {
            const subscription = event.data.object as SubscriptionWithPlan
            const previousAttributes = event.data
              .previous_attributes as PreviousAttributes

            const customerId = subscription?.customer.toString()
            const { uuid, uid, customer } = await getCustomerMetadata(
              customerId
            )

            if (!uid) {
              throw new Error(
                'customer missing uid for customer.subscription.updated'
              )
            }

            // When a subscription is changed, update the subscription object for the user
            await updateRecord<User>(db, 'users', uid, {
              userId: uid,
              data: {
                subscription: buildSubscriptionObject(
                  subscription,
                  customer as Stripe.Customer
                ),
              },
            })

            if (!uuid) {
              throw new Error(
                'customer missing uuid for customer.subscription.updated'
              )
            }

            // This checks for canceled subscriptions
            if (
              subscription.cancel_at_period_end === true &&
              previousAttributes.cancel_at_period_end === false
            ) {
              // We handle this in /src/pages/api/payment/cancel-subscription.ts
              // This gets triggered when a user cancels their subscription
              // We don't want to send a cancellation email, slack message, mixpanel event etc here because it will be sent twice
            }

            Analytics.setUserProps(uuid, {
              [MixpanelUserProps.subscriptionStatus]: subscription.status,
            })
            break
          }

          default:
            throw new Error(`unhandled event: ${event.type}`)
        }
      } catch (error) {
        Analytics.trackEvent('', 'webhook.stripe.error', {
          event: event.type,
          error: error.message,
        })

        // Report to Slack when we fail to handle a Stripe webhook
        logSlackMessage('stripe-webhook', error.message, 'error')

        return res.status(400).send('Webhook error: ' + error.message)
      }
    }

    res.json({ received: true })
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}

const getCustomerMetadata = async (customerId?: string) => {
  if (!customerId)
    return {
      uuid: null,
      uid: null,
      email: null,
      utmCampaign: null,
    }

  const customer = await stripe.customers.retrieve(customerId)
  const uuid = (customer as unknown as CustomerWithMetadata)?.metadata?.uuid
  const uid = (customer as unknown as CustomerWithMetadata)?.metadata?.uid
  const email = (customer as Stripe.Customer)?.email
  const utmCampaign =
    (customer as unknown as CustomerWithMetadata)?.metadata?.utm_campaign ||
    null

  return {
    uuid,
    uid,
    email,
    utmCampaign,
    customer,
  }
}

// This method is responsible for checking if user has a referral code attached to their account
// if thats the case we are going to add credits to the referrer account if the user has not redeemed it yet
// we run this method only when use successfully pays for the subscription
const completeReferralConversion = async (
  db: FirebaseFirestore.Firestore,
  uid: string,
  uuid: string
) => {
  // Get user by uid from FB
  const { data: referredUser } = await fetchOne<Partial<User>>(db, 'users', uid)
  const referralCode = referredUser?.referredByCode

  // If user does not have a referral code attached to their account return early
  if (!referralCode) {
    return
  }

  const price = await stripe.prices.retrieve(referralCreditPriceId)

  if (!price?.unit_amount) {
    throw new Error(`[ERROR] Stripe price ${referralCreditPriceId} not found`)
  }

  const { docs: referralDocs } = await fetchGroup<Referral>(
    db,
    'referrals',
    async (query) => query.where('code', '==', referralCode)
  )

  // Here we set flags to determine if we should add credits to a referrer profile
  let alreadyRedeemed = false
  let referrerId: undefined | string

  for (const doc of referralDocs) {
    const referrerSnap = doc.data()
    // If referrer code matches
    if (referrerSnap.code === referralCode) {
      // Check if current user uid is already in the list of 'subscribers' return early
      if (referrerSnap.subscribers.includes(uid)) {
        alreadyRedeemed = true
        break
      }

      // Remove duplicates and add current user uid to referrer subscribers
      const updatedSubscribersSet = new Set([...referrerSnap.subscribers, uid])
      const updatedSubscribers = Array.from(updatedSubscribersSet)
      await doc.ref.set(
        {
          subscribers: updatedSubscribers,
          credit: referrerSnap.credit + price.unit_amount, // convert to cents
        },
        { merge: true }
      )
      referrerId = doc.ref.parent.parent?.id

      break
    }
  }

  // If haven't redeemed before and a referrerId set, run credits redemption
  if (!alreadyRedeemed && referrerId) {
    const { data: referringUser } = await fetchOne<Partial<User>>(
      db,
      'users',
      referrerId
    )
    const referrerCustomerId = referringUser?.subscription?.customerId
    const referredCustomerId = referredUser?.subscription?.customerId

    if (!referrerCustomerId) {
      throw new Error(
        `[ERROR] Can not find customer id for referrer ${referrerId}`
      )
    }

    await stripe.customers.createBalanceTransaction(referrerCustomerId, {
      // Negative value indicates a credit for the next billing cycle (i.e. a discount)
      amount: -price.unit_amount,
      currency: price.currency,
    })

    if (referredCustomerId) {
      await stripe.customers.createBalanceTransaction(referredCustomerId, {
        // Negative value indicates a credit for the next billing cycle (i.e. a discount)
        amount: -price.unit_amount,
        currency: price.currency,
      })
    }

    Analytics.trackEvent(uuid, 'referral.stage.success', {
      stage: ReferralConversionStage[ReferralConversionStage.subscribe],
      referralCode,
      amount: price.unit_amount,
      currency: price.currency,
    })
    if (referringUser.uuid) {
      Analytics.incrementUserProp(
        referringUser.uuid,
        MixpanelUserProps.totalReferrals,
        1
      )
      Analytics.incrementUserProp(
        referringUser.uuid,
        MixpanelUserProps.totalReferralCredits,
        price.unit_amount
      )
    }
  }
}

export default cors(webhookHandler as any)
