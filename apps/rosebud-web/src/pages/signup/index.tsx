import { Box, Flex, Link, Text } from '@chakra-ui/react'
import navigator from 'lib/routes'
import { ReactElement, useCallback, useState } from 'react'
import Layout from 'ui/global/Layout'
import NextLink from 'next/link'
import Analytics from 'lib/analytics'
import SignUpForm from 'ui/pages/signup/SignUpForm'
import { useRouter } from 'next/router'
import { NextPageContext } from 'next'
import { getFirebaseToken, getFirebaseUserFromToken } from 'util/auth'
import FormGenericError from 'ui/core/FormGenericError'
import TopBar from 'ui/global/TopBar'
import { useSubscriptionProvider } from 'providers/SubscriptionProvider'
import { ReferralConversionStage } from 'constants/referral'
import { useReferralConversion } from 'shared/hooks/useReferralConversion'
import { useUserProvider } from 'providers/UserProvider'
import { kViewPadding } from 'shared/ui/constants'
import NavigationBarSignedOut from 'ui/global/Navigation/NavigationBar/NavigationBarSignedOut'
import Panel from 'ui/core/Panel'

type Props = {
  isUserValid?: boolean
}

const SignUpPage = ({ isUserValid }: Props) => {
  const router = useRouter()
  const triggerReferralStage = useReferralConversion()
  const [error, setError] = useState<string | null>(null)
  const { isSubscriptionActive, subscriptionTierName } =
    useSubscriptionProvider()
  const { user } = useUserProvider()

  const handleComplete = useCallback(async () => {
    await triggerReferralStage(
      ReferralConversionStage.signup,
      user.referredByCode
    )
    await router.replace(navigator.default, undefined, { shallow: true })
    Analytics.trackEvent('signUp.success')
  }, [router, triggerReferralStage, user.referredByCode])

  const handleError = async (message: string) => {
    Analytics.trackEvent('signUp.error', { error: message })
    setError(message)
  }

  // If user is anonymous and has a subscription
  // This happens when a user upgrades in the onboarding once they hit the dig deeper limit
  const signUpAfterSubscribe = Boolean(
    !user?.email && user.subscription?.customerId
  )

  return (
    <>
      <NavigationBarSignedOut title='Create account' overlayEffect={false} />
      <Flex px={kViewPadding} direction='column' mt={12} gap={4}>
        <Panel overflow='hidden' p={0}>
          <TopBar
            title={
              signUpAfterSubscribe
                ? `👑 Welcome to Rosebud ${subscriptionTierName ?? 'Premium'}`
                : 'Create account'
            }
            hideBackButton
            display={{
              base: signUpAfterSubscribe ? 'flex' : 'none',
              md: 'flex',
            }}
          />
          <Box pt={6}>
            <FormGenericError error={error} />
            {signUpAfterSubscribe ? (
              <Box px={4} pb={4}>
                <Text>
                  Create your Rosebud {subscriptionTierName ?? ''} account now
                  to start your subscription
                </Text>
              </Box>
            ) : null}
            <Box px={4}>
              <SignUpForm
                initialEmail={user.subscription?.customerEmail ?? undefined}
                onComplete={handleComplete}
                onError={handleError}
                signUpAfterSubscribe={signUpAfterSubscribe}
              />
            </Box>
            {/* Don't allow sign in for anonymous users with a subscription */}
            {isUserValid && !isSubscriptionActive && (
              <Flex pb={6} pt={4} justify='center'>
                <Link
                  as={NextLink}
                  passHref
                  shallow
                  href={navigator.signin}
                  color='brand.500'
                >
                  Sign into existing account
                </Link>
              </Flex>
            )}
          </Box>
        </Panel>
      </Flex>
    </>
  )
}

SignUpPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout hideMobileNav hideMenu showHelp>
      {page}
    </Layout>
  )
}

export const getServerSideProps = async (context: NextPageContext) => {
  try {
    const token = getFirebaseToken(context)

    if (!token) {
      // If not signed in, redirect to onboarding page
      throw new Error('No token found')
    }

    const user = await getFirebaseUserFromToken(token)
    const isUserValid = user && !user?.disabled
    const isUserAnonymous = !user?.email

    // If already signed in and not anonymous, redirect to home page
    if (isUserValid && !isUserAnonymous) {
      return {
        redirect: {
          destination: navigator.default,
        },
      }
    }

    return {
      props: {
        isUserValid,
      },
    }
  } catch (err) {
    // If not signed in, redirect to onboarding page
    return {
      props: {
        isUserValid: false,
      },
    }
  }

  return {
    props: {},
  }
}

export default SignUpPage
