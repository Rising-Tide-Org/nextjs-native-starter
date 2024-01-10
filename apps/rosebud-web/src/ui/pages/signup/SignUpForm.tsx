import {
  Text,
  Button,
  VStack,
  Box,
  Link,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Flex,
} from '@chakra-ui/react'
import { useCallback, useState } from 'react'
import PasswordEntry from '../../core/PasswordInput'
import EmailEntry from '../../core/EmailInput'
import { useAuthProvider } from 'providers/AuthProvider'
import { validateForm } from 'util/form'
import NextLink from 'next/link'
import navigator from 'lib/routes'

type Props = {
  onComplete: () => Promise<void>
  onError: (error: string) => void
  onSignInAnonymously?: () => Promise<void>
  withCreateAnonymous?: boolean
  initialEmail?: string
  signUpAfterSubscribe?: boolean
}

type FormElements = HTMLFormElement &
  HTMLFormControlsCollection & {
    email: HTMLInputElement
    password: HTMLInputElement
  }

const SignUpForm = ({
  onComplete,
  onError,
  onSignInAnonymously,
  initialEmail,
  withCreateAnonymous = false,
  signUpAfterSubscribe,
}: Props) => {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [loadingAnonymous, setLoadingAnonymous] = useState(false)
  const { signUp, signInAnonymously } = useAuthProvider()

  const handleSignUp = useCallback(
    async (e: React.FormEvent<FormElements>) => {
      e.preventDefault()

      setErrors({})

      const elements = e.currentTarget.elements as FormElements

      const { success, errors } = validateForm([
        elements.email,
        elements.password,
      ])

      const email = elements.email.value
      const password = elements.password.value

      // Ignore the submission if any of the form elements are invalid
      if (!success) {
        onError('Please fix the errors below')
        setErrors(errors)
        return
      }

      try {
        setLoading(true)
        await signUp(email, password)
        await onComplete()
      } catch (error) {
        onError(error)
      } finally {
        setLoading(false)
      }
    },
    [onComplete, onError, signUp]
  )

  const handleSignInAnonymously = useCallback(async () => {
    if (typeof onSignInAnonymously === 'function') {
      return onSignInAnonymously()
    }

    try {
      setLoadingAnonymous(true)
      await signInAnonymously()
      await onComplete()
    } catch (error) {
      onError(error)
    } finally {
      setLoadingAnonymous(false)
    }
  }, [onComplete, onError, signInAnonymously, onSignInAnonymously])

  return (
    <form onSubmit={handleSignUp}>
      <FormControl isInvalid={Boolean(errors['email'])}>
        <VStack pb={2}>
          <FormLabel alignSelf='start' fontSize='md'>
            Email
          </FormLabel>
          <EmailEntry defaultValue={initialEmail} />
          <FormErrorMessage alignSelf='start'>
            {errors['email']}
          </FormErrorMessage>
        </VStack>
      </FormControl>

      <FormControl isInvalid={Boolean(errors['password'])}>
        <VStack fontSize='lg' mb={6} mt={2}>
          <FormLabel alignSelf={'start'} fontSize='md'>
            Password
          </FormLabel>
          <PasswordEntry />
          <FormErrorMessage alignSelf='start'>
            {errors['password']}
          </FormErrorMessage>
        </VStack>
      </FormControl>
      <VStack mb={withCreateAnonymous ? 6 : 0} mt={2}>
        <Button
          type='submit'
          variant='primary'
          isLoading={loading}
          width='100%'
          size='lg'
          data-testid='sign-up-create-account'
        >
          Create free account
        </Button>
      </VStack>
      {withCreateAnonymous ? (
        <VStack mt={2}>
          <Button
            variant='ghost'
            onClick={handleSignInAnonymously}
            width='100%'
            size='sm'
            isLoading={loadingAnonymous}
            data-testid='sign-in-anonymously-btn'
          >
            Continue without account
          </Button>
        </VStack>
      ) : null}
      {!signUpAfterSubscribe ? (
        <Flex
          mt={3}
          p={4}
          direction='row'
          align='center'
          justifyContent='center'
        >
          <Text>
            Already have an account?&nbsp;
            <Link
              as={NextLink}
              passHref
              shallow
              href={navigator.signin}
              fontWeight='bold'
              color='brand.500'
            >
              Sign in
            </Link>
          </Text>
        </Flex>
      ) : null}
      <Box p={6}>
        <Text variant={'tertiary'} fontSize='15px' align='center'>
          By signing up, you agree to our
          <br />
          <Link
            href='https://help.rosebud.app/about-us/terms-of-service'
            isExternal
            color='brand.400'
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            href='https://help.rosebud.app/about-us/privacy-policy'
            isExternal
            color='brand.400'
          >
            Privacy Policy
          </Link>
          .
        </Text>
      </Box>
    </form>
  )
}

export default SignUpForm
