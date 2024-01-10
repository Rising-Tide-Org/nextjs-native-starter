import { useDisclosure, Box, Text, Flex, Button, Link } from '@chakra-ui/react'
import Analytics from 'lib/analytics'
import { useSubscriptionProvider } from 'providers/SubscriptionProvider'
import { useUserProvider } from 'providers/UserProvider'
import { useCallback, useEffect, useState } from 'react'
import { UserFlag } from 'types/User'
import { makeTypeformQueryString } from 'util/typeform'
import DrawerOrModal from '../DrawerOrModal'
import StarRatingInput from './StarRatingInput'

type Props = {
  /**
   * Days since first entry. After 7 days, we ask user to submit a Typeform survey.
   * After 30 days, we ask for a TrustPilot review.
   */
  daysSurveyedAfter: 7 | 30
}

const ProductSatisfactionSurveyModal = ({ daysSurveyedAfter }: Props) => {
  const { user, setUserFlag } = useUserProvider()
  const { isOpen, onClose, onOpen } = useDisclosure()
  const { isSubscriptionActive } = useSubscriptionProvider()
  const [starValue, setStarValue] = useState<number>()
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!user) return

    // open the modal as configured as long as the user hasn't ever seen it.
    if (
      (daysSurveyedAfter === 7 &&
        !user.flags?.[UserFlag.satisfactionSurvey7DayDismissed]) ||
      (daysSurveyedAfter === 30 &&
        !user.flags?.[UserFlag.satisfactionSurvey30DayDismissed])
    ) {
      Analytics.trackEvent('modal.satisfactionSurvey.view', {
        interval: daysSurveyedAfter,
      })
      onOpen()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const captureRating = useCallback(
    (rating: number) => {
      if (rating) {
        Analytics.trackEvent('modal.satisfactionSurvey.rating', {
          rating,
          interval: daysSurveyedAfter,
        })
      }

      const flag =
        daysSurveyedAfter === 7
          ? UserFlag.satisfactionSurvey7DayDismissed
          : UserFlag.satisfactionSurvey30DayDismissed
      setUserFlag(flag, true)
    },
    [daysSurveyedAfter, setUserFlag]
  )

  const handleOnClose = useCallback(() => {
    // Capture the rating if they dismiss without submitting
    if (starValue && !submitted) {
      captureRating(starValue)
    }

    Analytics.trackEvent('modal.satisfactionSurvey.dismiss', {
      interval: daysSurveyedAfter,
    })
    onClose()
  }, [starValue, submitted, daysSurveyedAfter, onClose, captureRating])

  const handleSubmit = (value: number) => {
    captureRating(value)
    if (daysSurveyedAfter > 7 && value < 5) {
      onClose()
    } else {
      setSubmitted(true)
    }
  }

  const typeFormUrl = `https://justimagine.typeform.com/to/h8XhIwyt#${makeTypeformQueryString(
    user,
    isSubscriptionActive
  )}`
  const trustPilotUrl = 'https://www.trustpilot.com/review/rosebud.app'
  const ctaUrl = daysSurveyedAfter > 7 ? trustPilotUrl : typeFormUrl
  const ctaLabel =
    daysSurveyedAfter > 7 ? (
      <>Review us on TrustPilot &rarr;</>
    ) : (
      <>Take a 5 minute survey &rarr;</>
    )

  return (
    <DrawerOrModal isOpen={isOpen} onClose={handleOnClose} onOpen={onOpen}>
      <Box p={4} pt={14}>
        <Flex p={4} rounded='md' gap={2} direction='column' align='center'>
          {submitted ? (
            <>
              <Text mb={2} textAlign='center' fontWeight={500} fontSize='40px'>
                🙏
              </Text>
              <Text mb={4} textAlign='center' fontWeight={500} fontSize='20px'>
                Thank you for your feedback!
              </Text>
              <Text mb={8} textAlign='center'>
                We'd love to hear more about your experience with Rosebud.
              </Text>
              <Link isExternal href={ctaUrl} rel='noreferrer'>
                <Button variant='primary' w='280px' size='lg'>
                  {ctaLabel}
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Text mb={4} textAlign='center'>
                How would you rate your Rosebud experience so far?
              </Text>
              <StarRatingInput
                onChange={setStarValue}
                onSubmit={handleSubmit}
              />
            </>
          )}
        </Flex>
      </Box>
    </DrawerOrModal>
  )
}

export default ProductSatisfactionSurveyModal
