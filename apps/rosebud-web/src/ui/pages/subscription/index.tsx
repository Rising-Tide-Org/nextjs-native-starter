import { Box, Divider, Flex, Link, Spinner, Tag, Text } from '@chakra-ui/react'
import navigator from 'lib/routes'
import moment from 'moment'
import { useRouter } from 'next/router'
import { useModalProvider } from 'providers/ModalProvider'
import { useSubscriptionProvider } from 'providers/SubscriptionProvider'
import { useEffect, useMemo } from 'react'
import { Subscription } from 'types/Subscription'
import { kViewPadding } from 'shared/ui/constants'
import EmptyPageState from 'ui/core/EmptyPageState'
import Panel from 'ui/core/Panel'
import PageHeading from 'ui/global/PageHeading'
import NavigationBar from 'ui/global/Navigation/NavigationBar'
import PageLoading from 'ui/global/PageLoading'
import { formatCurrency } from 'util/currency'
import CustomerPortalButton from './CustomerPortalButton'
import { buildDiscountEndsString, buildPriceString } from 'util/stripe'

const SubscriptionComponent = () => {
  const {
    isSubscriptionLoading,
    subscription,
    isSubscriptionPresent,
    subscriptionTierName,
  } = useSubscriptionProvider()
  const openModal = useModalProvider()
  const router = useRouter()

  // Redirect to home if subscription is not valid
  useEffect(() => {
    if (isSubscriptionPresent === false) {
      router.push(navigator.default)
    }
  }, [isSubscriptionPresent, router])

  const priceString = useMemo(() => {
    return buildPriceString(subscription)
  }, [subscription])

  const discountEndString = useMemo(() => {
    return buildDiscountEndsString(subscription)
  }, [subscription])

  // Wait for subscription to load
  if (!isSubscriptionPresent) {
    return <PageLoading />
  }

  // TODO, flickers when reloaded on the page
  if (!subscription?.id && isSubscriptionLoading) {
    return <EmptyPageState afterElement={<Spinner />} />
  }

  return (
    <>
      <NavigationBar title='Subscription' />
      <PageHeading>Subscription</PageHeading>
      <Box p={kViewPadding}>
        <Panel>
          {subscription?.id ? (
            <Flex direction='column' gap={4}>
              <Box rounded='md'>
                <Flex direction='column' gap={2}>
                  {subscription.cancelAt ? (
                    <Text>
                      Your subscription has been canceled, but will remain
                      active until the end of this billing period.
                    </Text>
                  ) : (
                    <Text>{getSubscriptionText(subscription)}</Text>
                  )}
                  <Divider my={2} />
                  {subscription.price && subscription.product ? (
                    <Text>
                      <b>Plan:</b>{' '}
                      {subscriptionTierName
                        ? `Rosebud ${subscriptionTierName}`
                        : 'None'}
                    </Text>
                  ) : null}

                  {priceString ? (
                    <>
                      <Text>
                        <b>Price:</b> {priceString}
                      </Text>
                      {discountEndString ? (
                        <Tag
                          size='md'
                          backgroundColor={'yellow.200'}
                          py={2}
                          px={3}
                        >
                          {discountEndString}
                        </Tag>
                      ) : null}
                    </>
                  ) : null}

                  {subscription.currentPeriodEnd ? (
                    <Text>
                      <b>
                        {subscription.cancelAt
                          ? 'Active through'
                          : subscription.status === 'trialing'
                          ? 'Renews on'
                          : 'Next bill date'}
                        :
                      </b>{' '}
                      {moment(subscription.currentPeriodEnd * 1000).format(
                        'MMMM Do, YYYY'
                      )}
                    </Text>
                  ) : null}

                  <Flex justify='space-between'>
                    <Text>
                      <b>Credit:</b>{' '}
                      {formatCurrency(
                        'USD',
                        Math.abs(subscription?.balance ?? 0)
                      )}{' '}
                    </Text>
                    <Link
                      color='brand.500'
                      onClick={() => openModal('referral')}
                    >
                      Earn free credit
                    </Link>
                  </Flex>
                </Flex>

                {isSubscriptionPresent ? (
                  <>
                    <Divider my={4} />
                    <Box mt={3}>
                      <CustomerPortalButton />
                    </Box>
                  </>
                ) : null}
              </Box>
            </Flex>
          ) : null}
        </Panel>
      </Box>
    </>
  )
}

const getSubscriptionText = (
  subscription: Partial<Subscription>
): string | React.ReactNode => {
  switch (subscription.status) {
    case 'active':
      return 'Your subscription is active.'
    case 'incomplete':
    case 'incomplete_expired':
      return "You didn't finish your checkout. Try again."
    case 'past_due':
    case 'unpaid':
      return 'Your subscription is past due, please update your payment method.'
    case 'canceled':
      return 'Your subscription is canceled, renew it to access all premium features.'
    case 'trialing':
      return (
        <>
          Your subscription is on a trial period and will automatically renew
          for{' '}
          <b>
            ${(subscription.price ?? 0) / 100} / {subscription.interval}
          </b>
          .
        </>
      )
    default:
      return 'Your subscription is inactive, please renew it.'
  }
}

export default SubscriptionComponent
