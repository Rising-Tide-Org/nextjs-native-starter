import {
  Modal,
  ModalOverlay,
  ModalContent,
  Flex,
  ModalCloseButton,
  Button,
  Text,
  Heading,
  Image,
  ModalBody,
  VStack,
  ModalFooter,
  ButtonGroup,
} from '@chakra-ui/react'
import {
  kProductPackages,
  kTrialPeriodDaysForNewUsers,
  PriceDiscoveryVariant,
  PriceIntervalVariant,
} from 'constants/premium'
import { useUserProvider } from 'providers/UserProvider'
import { useCallback, useMemo, useState } from 'react'
import {
  PriceInterval,
  PricePackage,
  SubscriptionSource,
  SubscriptionTier,
} from 'types/Subscription'
import { UserFlag } from 'types/User'
import {
  RbCalendarStroke,
  RbClock,
  RbConnected,
  RbEntries,
  RbGoDeeper,
  RbMemory,
  RbMicrophone,
  RbPencil,
  RbQuestion,
} from '../../Icon'
import { Subscription } from 'types/Subscription'
import PricingFeature, { FeatureProps } from 'ui/shared/PricingFeature'
import PlanSwitch from 'ui/shared/PlanSwitch'

type Props = {
  isOpen: boolean
  isLoading: boolean
  onCanSubmit: () => Promise<boolean>
  onSubmit: (
    pricePackage: PricePackage,
    onBeforeRedirect: () => Promise<void>,
    coupon?: string
  ) => Promise<void>
  onClose: () => void
  source: SubscriptionSource
  subscriptionStatus: Subscription['status'] | undefined
  subscriptionTier: SubscriptionTier | undefined
}

const NewUpgradeModal = ({
  isOpen,
  isLoading,
  onSubmit,
  onCanSubmit,
  onClose,
  source,
  subscriptionStatus,
  subscriptionTier,
}: Props) => {
  const { user, setUserFlag, updateUserFields } = useUserProvider()
  const [buttonLoading, setButtonLoading] = useState(isLoading)
  const [selectedBloom, setSelectedBloom] = useState(true)

  const showAnnualOnly =
    user.variants?.pricingInterval === PriceIntervalVariant.annualOnly

  const [interval, setInterval] = useState<PriceInterval>(
    showAnnualOnly ? 'yearly' : 'monthly'
  )

  const isSubscriptionCancelled = useMemo(
    () => subscriptionStatus === 'canceled',
    [subscriptionStatus]
  )
  const isSubscriptionPastDue = useMemo(
    () => ['past_due', 'unpaid'].includes(String(subscriptionStatus)),
    [subscriptionStatus]
  )

  const showDiscountedPrice =
    user.variants?.pricing === PriceDiscoveryVariant.withDiscount

  const pricePackage = useMemo<PricePackage>(
    () =>
      kProductPackages[selectedBloom ? 'bloom' : 'lite'].pricePackages[
        interval
      ][showDiscountedPrice ? 1 : 0],
    [selectedBloom, interval, showDiscountedPrice]
  )

  const setFlagsForClose = useCallback(async () => {
    await updateUserFields({
      'metadata.lastUpgradeReminder': Date.now(),
    })
    await setUserFlag(UserFlag.upgradePromoDismissed, true)
  }, [setUserFlag, updateUserFields])

  const handleClose = useCallback(async () => {
    await setFlagsForClose()
    onClose()
  }, [onClose, setFlagsForClose])

  const handleSubmit = async () => {
    setButtonLoading(true)

    const canSubmit = await onCanSubmit()

    if (canSubmit) {
      await onSubmit(pricePackage, async () => {
        await setFlagsForClose()
      })
      onClose()
    } else {
      setButtonLoading(false)
    }
  }

  const isCurrentPlan = useMemo(
    () => pricePackage.tier === subscriptionTier && !isSubscriptionCancelled,
    [pricePackage.tier, subscriptionTier, isSubscriptionCancelled]
  )

  const buttonText = useMemo(() => {
    if (isCurrentPlan) {
      return 'Current plan'
    }

    if (isSubscriptionCancelled) {
      return `Subscribe for $${pricePackage.price}/${
        pricePackage.interval === 'monthly' ? 'mo' : 'yr'
      }`
    }

    if (isSubscriptionPastDue) {
      return 'Update payment method'
    }

    if (subscriptionTier && !isCurrentPlan) {
      return 'Update plan'
    }

    return `Start ${kTrialPeriodDaysForNewUsers}-day free trial`
  }, [
    isCurrentPlan,
    isSubscriptionCancelled,
    isSubscriptionPastDue,
    pricePackage.interval,
    pricePackage.price,
    subscriptionTier,
  ])

  const tierFeatures = useMemo(() => {
    const features: FeatureProps[] = [
      {
        Icon: RbConnected,
        content: 'Long-term memory',
        isBloomOnly: true,
        tooltipLabel:
          'Rosebud AI will recall and reference past entries while you journal.',
      },
      {
        Icon: RbQuestion,
        content:
          source === 'askRosebud' ? 'Ask Rosebud' : 'Personality insights',
        isBloomOnly: true,
        tooltipLabel:
          'Ask Rosebud anything about yourself and Rosebud will answer based on your entries.',
      },
      {
        Icon: RbMemory,
        content: 'Advanced AI',
        isLimited: true,
        tooltipLabel: 'Used on fewer features for Premium',
      },
      {
        Icon: RbMicrophone,
        content: 'Voice journaling',
      },
      {
        Icon: RbPencil,
        content: 'Personalized prompts',
      },
      {
        Icon: RbEntries,
        content: 'Weekly insights',
      },
      {
        Icon: RbCalendarStroke,
        content: 'Habit setting and tracking',
      },
    ]

    if (source === 'digDeeperLimitReached') {
      features.unshift({
        Icon: RbGoDeeper,
        content: 'Dig deeper into your entries',
      })
    } else if (source === 'yearInReview') {
      features.unshift({
        Icon: RbClock,
        content: 'Year in Review',
        isBloomOnly: true,
      })
    }

    return features
  }, [source])

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      preserveScrollBarGap
      closeOnOverlayClick={false}
      motionPreset='slideInBottom'
      autoFocus={true}
      scrollBehavior='inside'
      size={{ base: 'full', md: 'md' }}
    >
      <ModalOverlay />
      <ModalContent rounded='md' overflow='hidden'>
        <ModalBody p={0} mb={{ base: 40, md: 0 }}>
          <Flex
            flexDir='column'
            pt={12}
            pb={20}
            h={{
              base: '310px',
            }}
            background='linear-gradient(180deg, #FFFDF2 0%, #FFEDCF 41.93%)'
            position='relative'
          >
            <Image
              alt='early bird gets the worm!'
              src='/images/subscription/upgrade-illustration.png'
              position='absolute'
              bottom={0}
              right={0}
            />
            <Heading
              as='h2'
              fontSize={34}
              fontFamily='Outfit'
              fontWeight='bold'
              textAlign='center'
              mt={4}
              mb={3}
              zIndex={1}
              color='gray.900'
            >
              Grow without limits
            </Heading>
            <Text
              color='brandGray.700'
              textAlign='center'
              fontSize='md'
              px={8}
              zIndex={1}
            >
              {source === 'digDeeperLimitReached' ? (
                <>You've run out of dig deepers for this entry.</>
              ) : (
                <>
                  "I genuinely feel that Rosebud has changed my life." —
                  Vishakha R
                </>
              )}
            </Text>
          </Flex>
          <ModalCloseButton
            data-testid='upgrade-promo-close'
            color='brandGray.500'
          />
          <Flex px={[4, 6, 16]} mt={-8}>
            <PlanSwitch
              onPlanChange={(isBloom) => setSelectedBloom(isBloom)}
              priceInterval={interval}
              showDiscountedPrice={showDiscountedPrice}
            />
          </Flex>
          <Flex flexDir='column' px={[4, 6, 8]} py={2} gap={8}>
            <Flex flexDir='column'>
              <VStack align='start' spacing={0}>
                <PricingFeature header={true} selectedBloom={selectedBloom} />
                {tierFeatures.map((feature, idx) => {
                  const {
                    Icon,
                    content,
                    tooltipLabel,
                    isBloomOnly,
                    isLimited,
                  } = feature
                  return (
                    <PricingFeature
                      key={idx}
                      Icon={Icon}
                      content={content}
                      tooltipLabel={tooltipLabel}
                      isBloomOnly={isBloomOnly}
                      isLimited={isLimited}
                      selectedBloom={selectedBloom}
                      iconBorderTopRadius={idx === 0}
                      iconBorderBottomRadius={idx === tierFeatures.length - 1}
                    />
                  )
                })}
              </VStack>
            </Flex>
          </Flex>
        </ModalBody>
        <ModalFooter
          position={{ base: 'fixed', md: 'relative' }}
          bottom={0}
          w='full'
          bg='bg'
          boxShadow={{ base: '0px -4px 12px rgba(0, 0, 0, 0.05)', md: 'none' }}
          zIndex={2}
        >
          <VStack w='full' spacing={3}>
            {!isSubscriptionPastDue && !isCurrentPlan && !showAnnualOnly && (
              <Flex align='center' gap={2} fontSize='15px' w='full'>
                <ButtonGroup
                  w='full'
                  border='1px solid'
                  borderColor='inherit'
                  p={1}
                  rounded='md'
                >
                  <Button
                    flex={1}
                    onClick={() => setInterval('monthly')}
                    size='sm'
                    rounded='sm'
                    variant={
                      pricePackage.interval === 'monthly' ? 'solid' : 'ghost'
                    }
                  >
                    <Text>Monthly</Text>
                  </Button>
                  <Button
                    flex={1}
                    rounded='sm'
                    gap={2}
                    onClick={() => setInterval('yearly')}
                    size='sm'
                    variant={
                      pricePackage.interval === 'yearly' ? 'solid' : 'ghost'
                    }
                  >
                    <Text>Yearly</Text>
                    <Text fontSize='13px' color='green.600' fontWeight={450}>
                      Save 20%
                    </Text>
                  </Button>
                </ButtonGroup>
              </Flex>
            )}
            <Button
              onClick={handleSubmit}
              variant='primary'
              fontSize='17px'
              size='lg'
              w='full'
              isLoading={buttonLoading}
              backgroundColor={selectedBloom ? 'bloom.500' : 'brand.500'}
              _hover={{
                bg: selectedBloom ? 'bloom.600' : 'brand.600',
              }}
              isDisabled={isCurrentPlan}
            >
              {buttonText}
            </Button>
            {!isSubscriptionCancelled &&
              !isSubscriptionPastDue &&
              !isCurrentPlan && (
                <Text color='brandGray.600'>
                  Automatically renews for ${pricePackage.price}/
                  {pricePackage.interval === 'monthly' ? 'month' : 'year'}
                </Text>
              )}
            {isSubscriptionPastDue && (
              <Text color='red.500' align='center'>
                Your subscription is past due. Please update your payment method
                to unlock premium features.
              </Text>
            )}
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default NewUpgradeModal
