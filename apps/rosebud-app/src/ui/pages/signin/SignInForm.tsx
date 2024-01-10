import { Button, VStack, FormLabel, FormControl } from '@chakra-ui/react'
import { useCallback, useState } from 'react'
import PasswordEntry from '../../core/PasswordInput'
import EmailEntry from '../../core/EmailInput'
import { useAuthProvider } from 'providers/AuthProvider'

type Props = {
  onComplete: () => Promise<void>
  onError: (error: string) => void
  withCreateAnonymous: boolean
  prefillEmail?: string
}

type FormElements = HTMLFormElement &
  HTMLFormControlsCollection & {
    email: HTMLInputElement
    password: HTMLInputElement
  }

const SignInForm = ({
  onComplete,
  onError,
  withCreateAnonymous,
  prefillEmail,
}: Props) => {
  const [loading, setLoading] = useState(false)
  const [loadingAnonymous, setLoadingAnonymous] = useState(false)
  const { signIn, signInAnonymously } = useAuthProvider()

  const handleSignIn = useCallback(
    async (e: React.FormEvent<FormElements>) => {
      e.preventDefault()

      const elements = e.currentTarget.elements as FormElements

      const email = elements.email.value
      const password = elements.password.value

      if (!email && !password) {
        onError('Please enter your email and password')
        return
      }

      if (!email) {
        onError('Please enter your email')
        return
      }

      if (!password) {
        onError('Please enter your password')
        return
      }

      try {
        setLoading(true)
        await signIn(email, password)
        await onComplete()
      } catch (error) {
        setLoading(false)
        onError(error)
      }
    },
    [onComplete, onError, signIn]
  )

  const handleSignInAnonymously = useCallback(async () => {
    try {
      setLoadingAnonymous(true)
      await signInAnonymously()
      await onComplete()
    } catch (error) {
      onError(error)
    } finally {
      setLoadingAnonymous(false)
    }
  }, [onComplete, onError, signInAnonymously])

  return (
    <form onSubmit={handleSignIn}>
      <FormControl>
        <VStack pb={2}>
          <FormLabel alignSelf='start' fontSize='md'>
            Email
          </FormLabel>
          <EmailEntry defaultValue={prefillEmail} />
        </VStack>
      </FormControl>

      <FormControl>
        <VStack fontSize='lg' mb={6} mt={2}>
          <FormLabel alignSelf={'start'} fontSize='md'>
            Password
          </FormLabel>
          <PasswordEntry />
        </VStack>
      </FormControl>
      <VStack mb={withCreateAnonymous ? 6 : 0} mt={2}>
        <Button
          type='submit'
          variant='primary'
          isLoading={loading}
          width='100%'
          size='lg'
        >
          Sign In
        </Button>
      </VStack>
      {withCreateAnonymous ? (
        <VStack px={6} mt={2}>
          <Button
            variant='outline'
            onClick={handleSignInAnonymously}
            width='100%'
            size='lg'
            isLoading={loadingAnonymous}
          >
            Continue without account
          </Button>
        </VStack>
      ) : null}
    </form>
  )
}

export default SignInForm
