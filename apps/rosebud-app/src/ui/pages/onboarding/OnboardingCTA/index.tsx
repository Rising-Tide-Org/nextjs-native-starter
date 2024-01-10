import {
  Box,
  Text,
  Button,
  Flex,
  Heading,
  Image,
  Link,
  useToast,
  Spacer,
  useColorMode,
} from '@chakra-ui/react'
import { IoIosArrowRoundForward } from 'react-icons/io'
import navigator from 'lib/routes'
import Analytics from 'lib/analytics'
import { memo, useCallback, useEffect, useState } from 'react'
import { useAuthProvider } from 'providers/AuthProvider'
import NextLink from 'next/link'
import MakeToast from 'ui/core/MakeToast'
import useSetReferralCode from 'hooks/useSetReferralCode'
import ComposeContainer from 'ui/pages/compose/ComposeContainer'

type Props = {
  subHeadingText?: string
  buttonLabel?: string
}

const kDefaultButtonLabel = 'Begin your journey'
const kDefaultSubHeadingText =
  'The #1 AI-powered journal for personal growth and mental health'

const OnboardingCTA = ({ subHeadingText, buttonLabel }: Props) => {
  const { signInAnonymously } = useAuthProvider()
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  // Scrape referral code from the query params and set it to local storage
  // We want to run it only on root url `/`
  const [referralCode, referralCodeSet] = useSetReferralCode()

  const { colorMode } = useColorMode()
  const backgroundImage = `/images/splash-${colorMode}.png`

  useEffect(() => {
    if (referralCodeSet) {
      Analytics.trackEvent('landing.view', {
        referralCode: referralCode ?? undefined, // Hide from mixpanel if null
      })
    }
  }, [referralCode, referralCodeSet])

  const handleBeginJourney = useCallback(async () => {
    if (isLoading) {
      return
    }
    setIsLoading(true)
    try {
      // This will trigger a redirect in the parent component
      await signInAnonymously()
    } catch (error) {
      Analytics.trackEvent('landing.error', { error })
      toast(
        MakeToast({
          title:
            'There was an issue signing you in anonymously, reload the page and try again',
          status: 'error',
        })
      )
      setIsLoading(false)
    }
  }, [isLoading, signInAnonymously, toast])

  return (
    <ComposeContainer mobileHeight='100%' borderless>
      <Box
        pos='relative'
        h='full'
        overflow='hidden'
        bg='brand.500'
        backgroundImage={`url(${backgroundImage})`}
        bgRepeat='no-repeat'
        bgSize='cover'
        boxSizing='border-box'
        rounded={{ md: 'lg' }}
      >
        <Flex
          flexDir='column'
          h='full'
          pos='relative'
          zIndex={1}
          align='center'
        >
          <Flex flexGrow={1} align='center' direction='column'>
            <Spacer />
            <Flex direction='column' align='center'>
              <Image
                src='/images/logo-white.svg'
                alt='logo'
                width='64px'
                m='0 auto'
              />
              <Heading
                as='h1'
                fontSize='34px'
                textAlign='center'
                py='40px'
                pb='20px'
                fontFamily='Outfit'
                fontWeight={700}
                color='white'
              >
                Welcome to Rosebud
              </Heading>
              <Text
                textAlign='center'
                fontSize={{ base: '20px', md: '24px' }}
                flex={1}
                maxW={{ base: '90%', md: '400px' }}
                color='white'
                whiteSpace='pre-wrap'
              >
                {subHeadingText ?? kDefaultSubHeadingText}
              </Text>
            </Flex>
            <Box
              my={8}
              position='relative'
              flexGrow={1}
              w='full'
              bg='url(/images/onboarding-arrow.svg) no-repeat center center'
              bgPos='bottom center'
            />
          </Flex>

          <Flex
            pb='40px'
            px={{ base: 6, lg: 12 }}
            direction='column'
            gap={6}
            w='full'
          >
            <Button
              variant={colorMode === 'dark' ? 'primary' : 'solid'}
              size='lg'
              rightIcon={<IoIosArrowRoundForward size='30px' />}
              w='full'
              bg={colorMode === 'dark' ? 'brand.500' : 'white'}
              fontWeight='bold'
              h='60px'
              fontSize='19px'
              data-testid='initiate-onboarding-btn'
              isLoading={isLoading}
              onClick={handleBeginJourney}
              transition='all 0.2s ease-in-out'
              _active={{
                bg: 'white',
              }}
              _hover={{
                bg: colorMode === 'dark' ? 'brand.600' : 'white',
                color: colorMode === 'dark' ? 'white' : 'text',
                transform: 'translateY(-3px)',
                boxShadow: '0 4px 30px 0 rgba(0,0,0,0.15)',
              }}
              maxW='380px'
              mx='auto'
            >
              {buttonLabel ?? kDefaultButtonLabel}
            </Button>
            <Link
              as={NextLink}
              href={navigator.signin}
              passHref
              alignSelf='center'
              color='white'
              fontSize='17px'
            >
              I already have an account
            </Link>
          </Flex>
        </Flex>
      </Box>
    </ComposeContainer>
  )
}

export default memo(OnboardingCTA)
