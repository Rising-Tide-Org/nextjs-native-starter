import {
  Button,
  Text,
  ButtonGroup,
  useDisclosure,
  VStack,
  Flex,
  useToast,
} from '@chakra-ui/react'
import { firebaseAuth } from 'db'
import { sendEmailVerification } from 'firebase/auth'
import routes from 'lib/routes'
import { useAuthProvider } from 'providers/AuthProvider'
import { useState } from 'react'
import FormGenericError from 'ui/core/FormGenericError'
import MakeToast from 'ui/core/MakeToast'
import { parseFirebaseError } from 'util/firebase'
import EmailUpdateModal from './EmailUpdateModal'

const EmailUpdate = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSent, setIsSent] = useState(false)
  const toast = useToast()

  const handleSendVerificationEmail = async () => {
    setLoading(true)
    const auth = firebaseAuth

    if (!auth.currentUser || auth?.currentUser?.isAnonymous) {
      return
    }

    try {
      await sendEmailVerification(auth.currentUser, {
        url: `${window.location.origin}${routes.signin}?returnTo=${window.location.pathname}`,
      })
      setIsSent(true)
      toast(
        MakeToast({
          title: 'Verification email sent',
          description:
            'Check your inbox for a verification email. Check spam too.',
        })
      )
    } catch (error) {
      console.error(error)
      setError(parseFirebaseError(error))
    } finally {
      setLoading(false)
    }
  }
  const { user: authUser } = useAuthProvider()
  const {
    isOpen: isEmailUpdateOpen,
    onOpen: onEmailUpdateOpen,
    onClose: onEmailUpdateClose,
  } = useDisclosure()

  return (
    <VStack align='start'>
      <Flex direction='column'>
        <Text>
          Logged in as{' '}
          {!authUser?.isAnonymous ? <b>{authUser?.email}</b> : <b>Guest</b>}
        </Text>
      </Flex>
      <FormGenericError error={error} mb={0} pl={0} pb={0} />
      {authUser?.email ? (
        <ButtonGroup pt={3}>
          <Button size='sm' variant='outline' onClick={onEmailUpdateOpen}>
            Update email
          </Button>

          {!authUser?.emailVerified ? (
            <Button
              variant='outline'
              size='sm'
              isLoading={loading}
              onClick={handleSendVerificationEmail}
              isDisabled={isSent}
            >
              {isSent ? 'Verification email sent' : 'Resend verification'}
            </Button>
          ) : null}
        </ButtonGroup>
      ) : null}

      <EmailUpdateModal
        isOpen={isEmailUpdateOpen}
        onClose={onEmailUpdateClose}
      />
    </VStack>
  )
}

export default EmailUpdate
