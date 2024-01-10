import { Flex, Text } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useSubscriptionProvider } from 'providers/SubscriptionProvider'
import navigator from 'lib/routes'

const BannerSubscriptionIssue = () => {
  const { subscription } = useSubscriptionProvider()
  const router = useRouter()

  if (!['past_due', 'unpaid'].includes(subscription?.status ?? '')) {
    return null
  }

  const handleClick = () => {
    router.push(navigator.subscription)
  }

  return (
    <>
      {['past_due'].includes(subscription?.status ?? '') && (
        <Flex
          bg='red.500'
          color='white'
          p={3}
          justify='center'
          onClick={handleClick}
          cursor='pointer'
        >
          <Text>
            Your subscription is past due. Please update your payment method to
            unlock premium features.
          </Text>
        </Flex>
      )}
    </>
  )
}

export default BannerSubscriptionIssue
