import { Button, Flex } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import navigator from 'lib/routes'
import Analytics from 'lib/analytics'
import { useSubscriptionProvider } from 'providers/SubscriptionProvider'
import { useCallback, useMemo, useState } from 'react'

const CustomerPortalButton = () => {
  const {
    subscription,
    isSubscriptionActive,
    redirectToCustomerPortal,
    openSubscribeModal,
  } = useSubscriptionProvider()
  const router = useRouter()

  const buttonText = useMemo(() => {
    if (subscription?.cancelAt) {
      return 'Renew'
    }

    switch (subscription?.status) {
      case 'active':
        return 'Manage'
      case 'canceled':
        return 'Renew'
      case 'past_due':
      case 'unpaid':
        return 'Update payment method'
      default:
        return 'Manage'
    }
  }, [subscription?.status, subscription?.cancelAt])

  const [isLoading, setIsLoading] = useState(false)
  const handleRedirectToCustomerPortal = async () => {
    Analytics.trackEvent('subscription.manage.click', {
      subscriptionStatus: subscription?.status,
    })

    if (subscription?.status === 'canceled') {
      openSubscribeModal('subscriptionPage')
      return
    }

    setIsLoading(true)

    const success = await redirectToCustomerPortal()
    if (!success) {
      setIsLoading(false)
    }
  }

  const handleCancellationFlow = useCallback(() => {
    Analytics.trackEvent('subscription.cancel.click', {
      status: subscription?.status,
      interval: subscription?.interval,
      price: subscription?.price ? `$${subscription?.price / 100}` : null,
    })

    router.push(navigator.subscriptionCancel)
  }, [subscription, router])

  const cancelButton = useMemo(() => {
    if (isSubscriptionActive && subscription?.cancelAtPeriodEnd === false) {
      return (
        <Button
          variant='outline'
          onClick={handleCancellationFlow}
          fontSize='14px'
        >
          Cancel plan
        </Button>
      )
    }
  }, [
    handleCancellationFlow,
    isSubscriptionActive,
    subscription?.cancelAtPeriodEnd,
  ])

  return (
    <Flex justifyContent='space-between'>
      <Button
        onClick={handleRedirectToCustomerPortal}
        variant='primary'
        size='md'
        isLoading={isLoading}
      >
        {buttonText}
      </Button>
      {cancelButton}
    </Flex>
  )
}

export default CustomerPortalButton
