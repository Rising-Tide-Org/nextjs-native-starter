import { Flex, Text } from '@chakra-ui/react'
import Analytics from 'lib/analytics'
import moment from 'moment'
import { useRouter } from 'next/router'
import { useSubscriptionProvider } from 'providers/SubscriptionProvider'

const productHuntUrl = 'https://www.producthunt.com/posts/rosebud'

const startDate = '2023-07-26 07:01:00'
const endDate = '2023-07-27 07:00:00'

const BannerProductHunt = () => {
  // const [show, setShow] = useState(false)
  const { subscription } = useSubscriptionProvider()
  const router = useRouter()

  const handleClick = () => {
    Analytics.trackEvent('banner.productHunt.click')
    const windowRef = window.open(productHuntUrl, '_blank')
    // will open it on the same tab if the pop-up is blocked
    if (!windowRef) {
      window.location.replace(productHuntUrl)
    }
  }

  const show = moment
    .utc()
    .isBetween(moment.utc(startDate), moment.utc(endDate))

  // Hide if show is false or if will conflict with past due banner
  if (
    !show ||
    ['past_due', 'unpaid'].includes(subscription?.status ?? '') ||
    router.pathname.match(/compose|onboarding|summary/g) ||
    router.pathname === '/'
  )
    return null

  return (
    <Flex
      bg='brand.500'
      color='white'
      p={3}
      justify='center'
      onClick={handleClick}
      cursor='pointer'
    >
      <Text align='center'>
        We just launched on Product Hunt 🚀 Please support us with an upvote!
        Vote now →
      </Text>
    </Flex>
  )
}

export default BannerProductHunt
