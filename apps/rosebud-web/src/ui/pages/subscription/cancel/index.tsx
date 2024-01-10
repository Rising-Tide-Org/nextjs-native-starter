import { useToast } from '@chakra-ui/react'
import { createRecord } from 'db/mutate'
import Analytics from 'lib/analytics'
import navigator from 'lib/routes'
import { cancelSubscription } from 'net/payment'
import { useRouter } from 'next/router'
import { useSubscriptionProvider } from 'providers/SubscriptionProvider'
import { useUserProvider } from 'providers/UserProvider'
import { useCallback, useEffect } from 'react'
import cancelTemplate from 'templates/cancel'
import { ComposeResponse, ComposeTemplate } from 'types/Compose'
import MakeToast from 'ui/core/MakeToast'
import PageLoading from 'ui/global/PageLoading'
import Compose from 'ui/pages/compose'

// This is the type of the responses for the cancel template
type CancelTemplateValueType = { [key: string]: string }

const SubscriptionCancel = () => {
  const {
    isSubscriptionPresent,
    subscription,
    checkSubscription,
    isSubscriptionActive,
  } = useSubscriptionProvider()
  const { user } = useUserProvider()
  const router = useRouter()
  const toast = useToast()

  useEffect(() => {
    if (!isSubscriptionActive) {
      router.push(navigator.default)
      return
    }

    Analytics.trackEvent('subscription.cancel.view', {
      status: subscription?.status,
      interval: subscription?.interval,
      price: subscription?.price ? `$${subscription?.price / 100}` : null,
    })
  }, [subscription, isSubscriptionActive, router])

  // When the user submits the cancel template, we want to
  // 1. Store the cancellation values on the user object in the database
  // 2. Make API call to Stripe to cancel the subscription
  // 3. Send this data to Airtable
  // 4. Send a Slack notification
  const submitCancellation = useCallback(
    async (responses: ComposeResponse[], template: ComposeTemplate) => {
      // Get the prompt ids from the template
      const promptFields = template.prompts.map((prompt) => prompt.id)

      // Filter the response based on this templates prompts
      // and store them into an object w/ the prompt id as the key
      const cancellationValues: CancelTemplateValueType = responses
        .filter((r) => Boolean(r.id) && promptFields.includes(r.id!))
        .reduce((acc, r) => {
          acc[r.id!] = r.response[0]?.trim()
          return acc
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        }, {} as CancelTemplateValueType)

      Analytics.trackEvent('subscription.cancel.submit', {
        status: subscription?.status,
        interval: subscription?.interval,
        price: subscription?.price ? `$${subscription?.price / 100}` : null,
        reason: cancellationValues[cancelTemplate.prompts[0].id!],
        moreDetails: cancellationValues[cancelTemplate.prompts[1].id!],
      })

      // Store the cancellation values on the user object
      try {
        await createRecord(
          'cancellations',
          cancellationValues,
          subscription?.id || 'default'
        )
      } catch (e) {
        console.error('Error storing user cancellation values in database:', e)
      }

      // Make API call to Stripe to cancel the subscription
      try {
        if (!subscription?.id) {
          throw new Error('No subscription id found')
        }

        // Cancel the subscription on Stripe
        await cancelSubscription(
          subscription.id,
          false,
          user.email,
          user.phone,
          cancellationValues[cancelTemplate.prompts[0].id!],
          cancellationValues[cancelTemplate.prompts[1].id!]
        )

        // Refresh the subscription data
        await checkSubscription()

        // Navigate back to subscription page
        await router.push(navigator.subscription, undefined, {
          shallow: true,
        })

        // Show toast for success of Stripe API call
        toast(
          MakeToast({
            title: 'Your subscription was canceled',
            status: 'success',
          })
        )

        Analytics.trackEvent('subscription.cancel.submit.success', {
          status: subscription?.status,
          interval: subscription?.interval,
          price: subscription?.price ? `$${subscription?.price / 100}` : null,
          reason: cancellationValues[cancelTemplate.prompts[0].id!],
          moreDetails: cancellationValues[cancelTemplate.prompts[1].id!],
        })
      } catch (e) {
        // Show toast for failure of Stripe API call
        toast(
          MakeToast({
            title:
              'Unable to cancel your subscription. Please try again later.',
            status: 'error',
          })
        )

        Analytics.trackEvent('subscription.cancel.submit.error', {
          status: subscription?.status,
          interval: subscription?.interval,
          price: subscription?.price ? `$${subscription?.price / 100}` : null,
          reason: cancellationValues[cancelTemplate.prompts[0].id!],
          moreDetails: cancellationValues[cancelTemplate.prompts[1].id!],
          error: e,
        })
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  // Wait for subscription to load
  if (!isSubscriptionPresent) {
    return <PageLoading />
  }

  return (
    <Compose
      templateId={cancelTemplate.id}
      onSave={submitCancellation}
      returnTo={navigator.subscription}
    />
  )
}

export default SubscriptionCancel
