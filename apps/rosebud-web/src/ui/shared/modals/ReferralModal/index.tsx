import {
  Modal,
  ModalOverlay,
  ModalContent,
  Flex,
  ModalCloseButton,
  Text,
  Box,
  ModalBody,
  Button,
  Input,
  InputGroup,
  useToast,
  Circle,
  VStack,
  InputRightElement,
  Link,
  useColorModeValue,
} from '@chakra-ui/react'
import { MixpanelUserProps } from 'constants/analytics'
import { fetchMany } from 'db/fetch'
import { createRecord } from 'db/mutate'
import { limit, query } from 'firebase/firestore'
import useFetchMany from 'hooks/useFetchMany'
import useShareContent from 'hooks/useShareContent'
import Analytics from 'lib/analytics'
import routes from 'lib/routes'
import { fetchNextApi } from 'net/api'
import { useSubscriptionProvider } from 'providers/SubscriptionProvider'

import { useUserProvider } from 'providers/UserProvider'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BiDollarCircle } from 'react-icons/bi'
import { BsClipboard2 } from 'react-icons/bs'
import { IoGift } from 'react-icons/io5'
import { Referral } from 'types/Referral'
import { UserFlag } from 'types/User'

import FormGenericError from 'ui/core/FormGenericError'
import HelpBubble from 'ui/core/HelpBubble'
import MakeToast from 'ui/core/MakeToast'
import SmallCapsHeading from 'ui/core/SmallCapsHeading'
import TopBar from 'ui/global/TopBar'
import { formatCurrency } from 'util/currency'

type Props = {
  isOpen: boolean
  onClose: () => void
}

const ReferralModal = ({ isOpen, onClose }: Props) => {
  const { user, setUserFlag } = useUserProvider()
  const { createStripeCustomer, checkSubscription, isSubscriptionActive } =
    useSubscriptionProvider()
  const lineBorderColor = useColorModeValue('brandGray.300', 'brandGray.500')

  const toast = useToast()
  const shareContent = useShareContent()

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const referralCodeInitialized = useRef(false)

  // Load the referral code
  const { loading: referralsLoading, data: referrals } = useFetchMany<Referral>(
    'referrals',
    (q) => query(q, limit(1)),
    {
      subscribe: true,
    }
  )

  // NOTE: We only want to show the first referral for now
  const referral = useMemo(() => referrals?.[0], [referrals])

  useEffect(() => {
    Analytics.trackEvent('referral.modal.view')
    setUserFlag(UserFlag.referralModalDismissed, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const generateReferralLink: () => Promise<any> = useCallback(async () => {
    if (referralCodeInitialized.current || !user.id) {
      return
    }

    referralCodeInitialized.current = true

    setLoading(true)

    try {
      Analytics.trackEvent('referral.code.generate')

      // Double check the user doesn't have a referral code
      const referralCheck = await fetchMany<Referral>('referrals', (q) =>
        query(q, limit(1))
      )
      if (referralCheck.length > 0) {
        Analytics.trackEvent('referral.code.generate.error', {
          error: 'User already has a referral code',
        })
        return
      }

      // Create a Stripe customer if they don't have one
      if (!user.subscription?.customerId && user.id && user.uuid) {
        await createStripeCustomer()
      }

      const response = await fetchNextApi<{ referralCode: string }>(
        '/api/referral/generateReferralCode'
      )

      if (response.error) {
        throw new Error(response.error?.message || 'Something went wrong')
      }

      const code = response.response?.referralCode

      if (!code) {
        throw new Error('Code was not generated, try again.')
      }

      await createRecord('referrals', {
        code,
        credit: 0,
        signups: [],
        trials: [],
        subscribers: [],
      })

      Analytics.trackEvent('referral.code.generate.success', { code })

      // Set the referral code on the Mixpanel user profile
      Analytics.setUserProps({
        [MixpanelUserProps.referralCode]: code,
      })
    } catch (error) {
      Analytics.trackEvent('referral.code.generate.error', {
        error: error.message,
      })
      setError(error?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [createStripeCustomer, user])

  /**
   * Generate the referral link if it doesn't exist
   */
  useEffect(() => {
    if (isOpen && !referralsLoading && !referral) {
      generateReferralLink()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, referralsLoading, referral])

  /**
   * On open check the subscription that will update user credit balance that we display here
   */
  useEffect(() => {
    if (isOpen) {
      checkSubscription()
    }
  }, [isOpen, checkSubscription])

  /**
   * Copy the referral link to the clipboard
   */
  const handleCopyCode = () => {
    Analytics.trackEvent('referral.code.copy')
    toast(
      MakeToast({
        title: 'Copied to clipboard',
        status: 'success',
      })
    )
    navigator.clipboard.writeText(referrerLink)
  }

  /**
   * Share the referral link with a message
   */
  const handleShare = () => {
    Analytics.trackEvent('referral.code.share')
    shareContent({
      text: "I've been using this AI-powered journal and it's amazing!\n\nRosebud is an interactive journal that gives you personalized feedback and guidance while you journal to help you self-reflect more easily. Each entry is then summarized and reflected back to you with key insights.\n\nGive it a try and let me know what you think!",
      url: referrerLink,
    })
  }

  const { credit, signups, trials, subscribers, code } = useMemo(
    () => ({
      credit: referral?.credit || 0,
      signups: referral?.signups?.length || 0,
      trials: referral?.trials?.length || 0,
      subscribers: referral?.subscribers?.length || 0,
      code: referral?.code || '',
    }),
    [referral]
  )

  /**
   * Refresh balance when the number of subscribers changes
   */
  useEffect(() => {
    checkSubscription()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscribers])

  const referrerLink = useMemo(
    () =>
      window.location.protocol +
      '//' +
      window.location.hostname +
      (window.location.port ? `:${window.location.port}` : '') +
      `?r=${code}`,
    [code]
  )

  const steps = useMemo(
    () => [
      {
        title: 'Signups',
        count: signups,
        tooltip: 'Number of people who created an account using your link',
      },
      {
        title: 'Trials',
        count: trials,
        tooltip: 'Number of people who started a trial using your link',
      },

      {
        title: 'Subscribers',
        count: subscribers,
        tooltip:
          'Number of people who became paying subscribers using your link',
      },
      {
        title: 'Referral credits',
        count: Math.abs(credit),
        tooltip: 'Amount of credit you have earned',
      },
    ],
    [credit, signups, subscribers, trials]
  )

  const isLoading = useMemo(
    () => referralsLoading || loading,
    [referralsLoading, loading]
  )

  const inputBg = useColorModeValue('bgSecondary', 'bg')

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      preserveScrollBarGap
      closeOnOverlayClick={false}
      motionPreset='slideInBottom'
      autoFocus={true}
      scrollBehavior='inside'
      size={{ base: 'full', md: 'md' }}
    >
      <ModalOverlay />
      <ModalContent rounded='md' overflow='hidden'>
        <ModalBody p={0}>
          <TopBar
            title='Give $5, Get $5'
            icon={<IoGift size='20px' />}
            hideBackButton
          />
          <ModalCloseButton data-testid='upgrade-promo-close' />
          <Flex flexDir='column' p={4} gap={8}>
            <FormGenericError error={error} />
            <Flex flexDir='column'>
              <VStack
                align='start'
                border='1px solid'
                borderColor='inherit'
                rounded='lg'
                p={4}
                spacing={3}
              >
                <Text fontSize='md'>
                  Share your link and get $5 for you and a friend when they pay
                  for Rosebud!
                </Text>
                <InputGroup size='md'>
                  <Input
                    bg={inputBg}
                    borderWidth={0}
                    pr='40px'
                    fontWeight={500}
                    isDisabled={isLoading}
                    value={isLoading ? 'Fetching link...' : referrerLink}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    readOnly
                  />
                  <InputRightElement cursor='pointer'>
                    <BsClipboard2
                      fill='gray'
                      onClick={() => handleCopyCode()}
                    />
                  </InputRightElement>
                </InputGroup>
                <Button
                  onClick={handleShare}
                  w='full'
                  variant='primary'
                  isLoading={isLoading}
                >
                  Share
                </Button>
              </VStack>
            </Flex>
            <Flex flexDir='column'>
              <SmallCapsHeading>Referral Stats</SmallCapsHeading>

              <Flex
                border='1px solid'
                borderColor='inherit'
                rounded='lg'
                direction='column'
              >
                {steps.map((step, index) => {
                  return (
                    <Flex
                      align='center'
                      key={index}
                      w='full'
                      _notLast={{
                        borderBottom: '1px solid',
                        borderColor: 'inherit',
                      }}
                      p={4}
                    >
                      <Box position='relative'>
                        <Box w='18px'>
                          {index === steps.length - 1 ? (
                            <Box
                              as={BiDollarCircle}
                              boxSize='24px'
                              ml='-4px'
                              color={
                                step.count > 0 ? 'gold.700' : 'brandGray.500'
                              }
                            />
                          ) : (
                            <Circle
                              size='1em'
                              bg={step.count > 0 ? 'green.500' : 'transparent'}
                              borderWidth={step.count > 0 ? 0 : '2px'}
                              borderColor={
                                step.count > 0 ? 'green.500' : lineBorderColor
                              }
                            />
                          )}
                        </Box>

                        {index < steps.length - 1 && (
                          <Box
                            position='absolute'
                            top='1em'
                            left='0.45em'
                            height='40px'
                            borderLeft='2px solid'
                            borderColor={
                              step.count > 0 ? 'green.500' : lineBorderColor
                            }
                          />
                        )}
                      </Box>
                      <Flex flex='1' pl={4} align='center' gap={2}>
                        <Text
                          fontWeight={index === steps.length - 1 ? 500 : 450}
                        >
                          {step.title}
                        </Text>
                      </Flex>
                      <Flex
                        w='90px'
                        pl={4}
                        align='center'
                        gap={2}
                        justify='end'
                      >
                        <Text
                          fontWeight={index === steps.length - 1 ? 500 : 450}
                        >
                          {index === steps.length - 1
                            ? formatCurrency('USD', step.count)
                            : step.count}
                        </Text>
                        <HelpBubble label={step.tooltip} />
                      </Flex>
                    </Flex>
                  )
                })}
              </Flex>
              <Text
                fontSize='sm'
                variant='tertiary'
                mt={4}
                textAlign='center'
                px={4}
              >
                Referral credits can only be used to pay for your subscription.{' '}
                {isSubscriptionActive ? (
                  <>
                    Visit the{' '}
                    <Link href={routes.subscription} textDecor='underline'>
                      subscription page
                    </Link>{' '}
                    to see your current balance.
                  </>
                ) : (
                  <>Become a subscriber to use your credits.</>
                )}
              </Text>
            </Flex>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default ReferralModal
