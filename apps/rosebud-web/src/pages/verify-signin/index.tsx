import { Box, Button, Flex, Link, Text, VStack } from '@chakra-ui/react'
import navigator from 'lib/routes'
import { ChangeEvent, ReactElement, useCallback, useState } from 'react'
import Layout from 'ui/global/Layout'
import Analytics from 'lib/analytics'
import { useRouter } from 'next/router'
import { NextPageContext } from 'next'
import { getFirebaseToken, getFirebaseUserFromToken } from 'util/auth'
import FormGenericError from 'ui/core/FormGenericError'
import EmailEntry from 'ui/core/EmailInput'
import { firebaseAuth } from 'db'
import { signInWithEmailLink } from 'firebase/auth'
import { parseFirebaseError } from 'util/firebase'
import TopBar from 'ui/global/TopBar'
import NextLink from 'next/link'
import { kViewPadding } from 'ui/constants'
import Panel from 'ui/core/Panel'

type FormElements = HTMLFormElement &
  HTMLFormControlsCollection & {
    email: HTMLInputElement
  }

const VerifySignIn = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState<string>('')

  const handleEmailSet = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }, [])

  const handleComplete = useCallback(async () => {
    await router.push(navigator.default)
    Analytics.trackEvent('verifySignIn.success')
  }, [router])

  const handleSubmit = useCallback(
    async (e: React.FormEvent<FormElements>) => {
      e.preventDefault()

      const elements = e.currentTarget.elements as FormElements
      const formElements = [elements.email]

      const areAnyInvalidInputs = formElements.find((el) => el.ariaInvalid)

      // Ignore the submission if any of the form elements are invalid
      if (areAnyInvalidInputs) {
        return
      }

      if (!email) {
        return
      }

      try {
        setLoading(true)
        await signInWithEmailLink(firebaseAuth, email)
        await handleComplete()
      } catch (error) {
        Analytics.trackEvent('verifySignIn.error')
        setError(parseFirebaseError(error))
      } finally {
        setLoading(false)
      }
    },
    [email, handleComplete]
  )

  return (
    <>
      <Flex px={kViewPadding} direction='column' mt={12} gap={4}>
        <Panel p={0} overflow='hidden'>
          <TopBar title='Confirm your email' hideBackButton mb={6} />
          <FormGenericError error={error} />
          <form onSubmit={handleSubmit}>
            <VStack px={6} pb={6} spacing={4}>
              <Text fontSize='md'>
                To complete the sign in process, please enter your email below:
              </Text>
              <EmailEntry onChange={handleEmailSet} />
              <Button
                type='submit'
                variant='primary'
                isLoading={loading}
                width='100%'
                size='lg'
              >
                Sign in
              </Button>
              <Box pt={4}>
                <Link
                  as={NextLink}
                  passHref
                  shallow
                  href={navigator.signin}
                  color='brand.500'
                >
                  Sign in using password
                </Link>
              </Box>
            </VStack>
          </form>
        </Panel>
      </Flex>
    </>
  )
}

VerifySignIn.getLayout = function getLayout(page: ReactElement) {
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
      return {
        props: {},
      }
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
  } catch (err) {
    // No-op. Do nothing if failed validated the token, just allow user to access the page
  }

  return {
    props: {},
  }
}

export default VerifySignIn
