import { Box, Button, Flex, Link, Text, VStack } from '@chakra-ui/react'
import navigator from 'lib/routes'
import { ChangeEvent, ReactElement, useCallback, useState } from 'react'
import Layout from 'ui/global/Layout'
import Analytics from 'lib/analytics'
import FormGenericError from 'ui/core/FormGenericError'
import EmailEntry from 'ui/core/EmailInput'
import { firebaseAuth } from 'db'
import { sendPasswordResetEmail } from 'firebase/auth'
import { parseFirebaseError } from 'util/firebase'
import TopBar from 'ui/global/TopBar'
import NextLink from 'next/link'
import { kViewPadding } from 'shared/ui/constants'
import NavigationBarSignedOut from 'ui/global/Navigation/NavigationBar/NavigationBarSignedOut'
import Panel from 'ui/core/Panel'

type FormElements = HTMLFormElement &
  HTMLFormControlsCollection & {
    email: HTMLInputElement
  }

const PasswordReset = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState<string>('')
  const [isEmailSent, setIsEmailSent] = useState<boolean>(false)

  const handleEmailSet = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }, [])

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
        await sendPasswordResetEmail(firebaseAuth, email, {
          // Sending them to sign out as we want to clear whatever session they have and redirect to sign in link after
          url: `https://my.rosebud.app/${navigator.signout}`,
          handleCodeInApp: false,
        })
        setIsEmailSent(true)
        Analytics.trackEvent('passwordReset.success')
      } catch (error) {
        Analytics.trackEvent('passwordReset.error')
        setError(parseFirebaseError(error))
      } finally {
        setLoading(false)
      }
    },
    [email, setIsEmailSent]
  )

  if (isEmailSent) {
    return (
      <>
        <NavigationBarSignedOut
          title='Reset your password'
          overlayEffect={false}
        />
        <Flex px={kViewPadding} direction='column' mt={12} gap={4}>
          <Panel p={0} overflow='hidden'>
            <TopBar title='Email sent' hideBackButton mb={6} />
            <VStack px={6} pb={6} spacing={4}>
              <Text fontSize={64}>📫</Text>
              <Text fontWeight={450} align='center'>
                Check your email for a password reset link
              </Text>
            </VStack>
            <VStack px={6} pb={6} spacing={4}>
              <Box>
                <Link
                  as={NextLink}
                  passHref
                  shallow
                  href={navigator.signin}
                  color='brand.500'
                >
                  Back to sign in
                </Link>
              </Box>
            </VStack>
          </Panel>
        </Flex>
      </>
    )
  }

  return (
    <>
      <NavigationBarSignedOut
        onBack={() => window.history.back()}
        title='Reset your password'
        overlayEffect={false}
      />
      <Flex px={kViewPadding} direction='column' mt={12} gap={4} mb={6}>
        <Panel overflow='hidden' p={0}>
          <TopBar
            title='Reset your password'
            hideBackButton
            display={{ base: 'none', md: 'flex' }}
          />
          <Box pt={6}>
            <FormGenericError error={error} />
            <form onSubmit={handleSubmit}>
              <VStack px={6} pb={6} spacing={4}>
                <EmailEntry onChange={handleEmailSet} />
                <Button
                  type='submit'
                  variant='primary'
                  isLoading={loading}
                  width='100%'
                  size='lg'
                >
                  Reset password
                </Button>
                <Box pt={4}>
                  <Link
                    as={NextLink}
                    passHref
                    shallow
                    href={navigator.signin}
                    color='brandGray.500'
                  >
                    Back to sign in
                  </Link>
                </Box>
              </VStack>
            </form>
          </Box>
        </Panel>
      </Flex>
    </>
  )
}

PasswordReset.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout hideMobileNav hideMenu showHelp>
      {page}
    </Layout>
  )
}

export default PasswordReset
