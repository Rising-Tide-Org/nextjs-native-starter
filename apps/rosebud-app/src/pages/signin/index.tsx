import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Flex,
  Link,
  Text,
} from '@chakra-ui/react'
import navigator from 'lib/routes'
import { ReactElement, useEffect, useState } from 'react'
import Layout from 'ui/global/Layout'
import NextLink from 'next/link'
import Analytics from 'lib/analytics'
import SignInForm from 'ui/pages/signin/SignInForm'
import { useRouter } from 'next/router'
import FormGenericError from 'ui/core/FormGenericError'
import PageLoading from 'ui/global/PageLoading'
import { useAuthProvider } from 'providers/AuthProvider'
import { useEntryProvider } from 'providers/EntryProvider'
import TopBar from 'ui/global/TopBar'
import { kViewPadding } from 'shared/ui/constants'
import NavigationBarSignedOut from 'ui/global/Navigation/NavigationBar/NavigationBarSignedOut'
import Panel from 'ui/core/Panel'
import { getQueryParam } from 'util/url'

type Props = {
  // needsTokenRefresh?: boolean
  // redirectTo?: string
  isUserValid?: boolean
  isUserAnonymous?: boolean
  // email?: string
}

const SignInPage = ({ isUserAnonymous }: Props) => {
  const router = useRouter()

  const redirectTo = getQueryParam(router.query, 'redirectTo')
  const email = getQueryParam(router.query, 'email')
  const prefillEmail = email ? email : undefined
  const needsTokenRefresh = Boolean(getQueryParam(router.query, 'refresh'))

  const [error, setError] = useState<string | null>(null)
  const { refreshToken, user: authUser } = useAuthProvider()
  const [tokenRefreshPending, setTokenRefreshPending] =
    useState(needsTokenRefresh)
  const { entries } = useEntryProvider()

  useEffect(() => {
    Analytics.trackEvent('signIn.view', {
      needsTokenRefresh,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleComplete = async () => {
    Analytics.trackEvent('signIn.success')
  }

  const handleError = async (message: string) => {
    Analytics.trackEvent('signIn.error')
    setError(message)
  }

  useEffect(() => {
    if (needsTokenRefresh) {
      refreshToken()
        .then(async () => {
          await router.replace(redirectTo || navigator.home)
        })
        .finally(() => {
          setTokenRefreshPending(false)
        })
    }
  }, [needsTokenRefresh, refreshToken, router, redirectTo])

  useEffect(() => {
    if (authUser && !authUser.isAnonymous) {
      router.replace(redirectTo || navigator.home)
    }
  }, [authUser, router, redirectTo])

  // loader while the auth state is loading (ie, undefined) or once a logged-in state is found, just until the redirect.
  if (
    tokenRefreshPending ||
    authUser === undefined ||
    (authUser && !authUser.isAnonymous)
  ) {
    return <PageLoading />
  }

  return (
    <>
      <NavigationBarSignedOut title="Sign in" overlayEffect={false} />
      <Flex px={kViewPadding} mt={12} gap={2} direction="column" mb={6}>
        {isUserAnonymous && entries?.length > 0 ? (
          <Alert status="error" alignItems="top" rounded="md">
            <AlertIcon />
            <Flex direction="column" gap={1}>
              <Text>
                You have created entries as a guest. These entries will be lost
                when signing into an account.
              </Text>
            </Flex>
          </Alert>
        ) : null}
        <Panel overflow="hidden" p={0}>
          <TopBar
            title="Sign into Rosebud"
            hideBackButton
            display={{ base: 'none', md: 'flex' }}
          />
          <Box pt={6}>
            <FormGenericError error={error} />
            <Box px={4}>
              <SignInForm
                onComplete={handleComplete}
                onError={handleError}
                withCreateAnonymous={false}
                prefillEmail={prefillEmail}
              />
            </Box>

            <Flex pb={6} pt={4} direction="column" align="center" gap={6}>
              <Button variant="ghost" width="100%">
                <Link as={NextLink} passHref shallow href={navigator.default}>
                  Create an account
                </Link>
              </Button>
              <Link
                as={NextLink}
                passHref
                shallow
                href={navigator.passwordReset}
                color="brandGray.500"
              >
                Forgot your password?
              </Link>
            </Flex>
          </Box>
        </Panel>
      </Flex>
    </>
  )
}

SignInPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout hideMobileNav hideMenu showHelp>
      {page}
    </Layout>
  )
}

// export const getServerSideProps = async (context: NextPageContext) => {
//   const redirectTo = context?.query?.redirectTo
//   const email = context?.query?.email
//   const refresh = context?.query?.refresh
//   const props = {
//     needsTokenRefresh: refresh ? true : false,
//     ...(redirectTo ? { redirectTo } : {}),
//     ...(email ? { email } : {}),
//   }

//   return {
//     props,
//   }
// }

export default SignInPage
