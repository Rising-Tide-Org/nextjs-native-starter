import {
  Modal,
  ModalOverlay,
  ModalContent,
  Flex,
  ModalCloseButton,
  Button,
  Text,
  Heading,
  Box,
  Image,
  ModalBody,
  VStack,
  ModalFooter,
  ButtonGroup,
} from '@chakra-ui/react'
import {
  kDefaultPricePackage,
  kPricePackages,
  kTrialPeriodDaysForNewUsers,
} from 'constants/premium'
import { useUserProvider } from 'providers/UserProvider'
import { useCallback, useMemo, useState } from 'react'
import { PricePackage, SubscriptionSource } from 'types/Subscription'
import { UserFlag } from 'types/User'
import {
  RbBookmark,
  RbEntries,
  RbGoDeeper,
  RbInvincibility,
  RbMemory,
  RbMicrophone,
  RbPencil,
} from '../../Icon'
import { Subscription } from 'types/Subscription'

type Props = {
  isOpen: boolean
  isLoading: boolean
  onCanSubmit: () => Promise<boolean>
  onSubmit: (
    pricePackage: PricePackage,
    onBeforeRedirect: () => Promise<void>
  ) => Promise<void>
  onClose: () => void
  source: SubscriptionSource
  subscriptionStatus: Subscription['status'] | undefined
}

const UpgradeModal = ({
  isOpen,
  isLoading,
  onSubmit,
  onCanSubmit,
  onClose,
  source,
  subscriptionStatus,
}: Props) => {
  const { setUserFlag, updateUserFields } = useUserProvider()
  const [pricePackage, setPricePackage] = useState(kDefaultPricePackage)
  const [buttonLoading, setButtonLoading] = useState(isLoading)

  const isSubscriptionCancelled = useMemo(
    () => subscriptionStatus === 'canceled',
    [subscriptionStatus]
  )
  const isSubscriptionPastDue = useMemo(
    () => ['past_due', 'unpaid'].includes(String(subscriptionStatus)),
    [subscriptionStatus]
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

  const buttonText = useMemo(() => {
    if (isSubscriptionCancelled) {
      return `Subscribe for $${pricePackage.price}/${
        pricePackage.interval === 'monthly' ? 'mo' : 'yr'
      }`
    } else if (isSubscriptionPastDue) {
      return 'Update payment method'
    }
    return `Start ${kTrialPeriodDaysForNewUsers}-day free trial`
  }, [
    isSubscriptionCancelled,
    isSubscriptionPastDue,
    pricePackage.interval,
    pricePackage.price,
  ])

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
              base: '322px',
              sm: '342px',
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
            <Flex alignItems={'center'} justifyContent='center' gap={2}>
              <Flex px={3} py={0.5} bg='green.600' rounded='md'>
                <Text
                  color='white'
                  fontSize='xs'
                  fontFamily='Outfit'
                  fontWeight={500}
                  textTransform='uppercase'
                >
                  {isSubscriptionCancelled
                    ? 'Special offer'
                    : 'Limited Time Offer'}
                </Text>
              </Flex>
            </Flex>
            <Heading
              as='h2'
              fontSize={34}
              fontFamily='Outfit'
              fontWeight='bold'
              textAlign='center'
              mt={4}
              mb={3}
              color='gray.900'
            >
              Grow without limits
            </Heading>
            <Text color='brandGray.700' textAlign='center' fontSize='md' px={8}>
              {source === 'digDeeperLimitReached' ? (
                <>You've run out of dig deepers for this entry.</>
              ) : (
                <>
                  {isSubscriptionCancelled
                    ? 'Enjoy all the benefits of Premium'
                    : `As a thank you for being an early user, we'd like to offer you
                  a free ${kTrialPeriodDaysForNewUsers}-day trial.`}
                </>
              )}
            </Text>
          </Flex>
          <ModalCloseButton
            color='brandGray.500'
            data-testid='upgrade-promo-close'
          />
          <Flex flexDir='column' p={8} gap={8}>
            <Flex flexDir='column'>
              <Text variant={'tertiary'} mb={5}>
                Premium includes:
              </Text>
              <VStack align='start' spacing={3}>
                {source === 'digDeeperLimitReached' && (
                  <Flex align='center' gap={3}>
                    <RbGoDeeper boxSize='20px' color='brand.500' />
                    <Text fontWeight={500} fontSize='17px'>
                      Dig deeper into your entries
                    </Text>
                  </Flex>
                )}
                <Flex align='center' gap={3}>
                  <RbMemory boxSize='20px' color='brand.500' />
                  <Text fontWeight={500} fontSize='17px'>
                    Advanced AI with better responses
                  </Text>
                </Flex>
                <Flex align='center' gap={3}>
                  <RbMicrophone boxSize='20px' color='brand.500' />
                  <Text fontWeight={500} fontSize='17px'>
                    Voice journaling
                  </Text>
                </Flex>
                <Flex align='center' gap={3}>
                  <RbPencil boxSize='20px' color='brand.500' />
                  <Text fontWeight={500} fontSize='17px'>
                    Unlimited personalized prompts
                  </Text>
                </Flex>
                <Flex align='center' gap={3}>
                  <RbEntries boxSize='20px' color='brand.500' strokeWidth={2} />
                  <Text fontWeight={500} fontSize='17px'>
                    Unlimited entry history
                  </Text>
                </Flex>
                <Flex align='center' gap={3}>
                  <RbBookmark boxSize='20px' color='brand.500' />
                  <Text fontWeight={500} fontSize='17px'>
                    Bookmark your favorite prompts
                  </Text>
                </Flex>
              </VStack>
            </Flex>
            <Flex flexDir='column'>
              <Text color='brandGray.500' mb={5}>
                Coming soon to Premium:
              </Text>
              <VStack align='start' spacing={3}>
                <Flex align='center' gap={2}>
                  <Box as={RbInvincibility} boxSize='24px' color='#FFB800' />
                  <Text fontWeight={500} fontSize='17px'>
                    Personality insights
                  </Text>
                </Flex>
              </VStack>
            </Flex>
          </Flex>
        </ModalBody>
        <ModalFooter
          position={{ base: 'fixed', md: 'relative' }}
          bottom={0}
          w='full'
          boxShadow={{ base: '0px -4px 12px rgba(0, 0, 0, 0.05)', md: 'none' }}
        >
          <VStack w='full' spacing={3}>
            {!isSubscriptionPastDue && (
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
                    onClick={() => setPricePackage(kPricePackages[0])}
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
                    onClick={() => setPricePackage(kPricePackages[1])}
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
            >
              {buttonText}
            </Button>
            {!isSubscriptionCancelled && !isSubscriptionPastDue && (
              <Text color='brandGray.600'>
                Automatically renews for ${pricePackage.price}/
                {pricePackage.interval === 'monthly' ? 'month' : 'year'}
              </Text>
            )}
            {isSubscriptionPastDue && (
              <Text color='red.500' align='center'>
                Your subscription is past due. Please update your payment method
                to unlock Premium.
              </Text>
            )}
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default UpgradeModal
