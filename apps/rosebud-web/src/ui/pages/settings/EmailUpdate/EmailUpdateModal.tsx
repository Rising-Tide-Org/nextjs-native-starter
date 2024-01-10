import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalBody,
  Button,
  FormControl,
  FormLabel,
  VStack,
  ModalCloseButton,
  Text,
} from '@chakra-ui/react'
import { useState } from 'react'
import navigator from 'lib/routes'
import TopBar from 'ui/global/TopBar'
import { useRouter } from 'next/router'
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  sendEmailVerification,
} from 'firebase/auth'
import { parseFirebaseError } from 'util/firebase'
import EmailEntry from 'ui/core/EmailInput'
import FormGenericError from 'ui/core/FormGenericError'
import PasswordEntry from 'ui/core/PasswordInput'
import { useUserProvider } from 'providers/UserProvider'
import { firebaseAuth } from 'db'
import routes from 'lib/routes'

type Props = {
  isOpen: boolean
  onClose: () => void
}

type FormElements = HTMLFormElement &
  HTMLFormControlsCollection & {
    email: HTMLInputElement
  }

const EmailUpdateModal = ({ isOpen, onClose }: Props) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { updateUserFields } = useUserProvider()

  const handleEmailUpdate = async (e: React.FormEvent<FormElements>) => {
    e.preventDefault()
    const elements = e.currentTarget.elements as FormElements
    const email = elements.email.value
    const password = elements.password.value

    try {
      const auth = firebaseAuth
      if (
        !auth.currentUser ||
        auth?.currentUser?.isAnonymous ||
        !email ||
        !password
      ) {
        return
      }

      if (email === auth.currentUser.email) {
        setError('The email address is the same as the current one.')
        return
      }

      setLoading(true)

      const user = auth.currentUser
      const credential = EmailAuthProvider.credential(
        user.email as string,
        password
      )

      await reauthenticateWithCredential(user, credential)

      await updateEmail(auth.currentUser, email)
      await sendEmailVerification(auth.currentUser, {
        url: `${window.location.origin}${routes.signin}?returnTo=${window.location.pathname}`,
      })
      await updateUserFields({ email })

      await router.push(navigator.signout)

      setError(null)
    } catch (error) {
      console.error(error)
      setError(parseFirebaseError(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      preserveScrollBarGap
      closeOnEsc={false}
      closeOnOverlayClick={false}
      motionPreset='slideInBottom'
      autoFocus={true}
      scrollBehavior='inside'
      size={{ base: 'full', md: 'md' }}
    >
      <ModalOverlay />
      <ModalContent
        overflow='hidden'
        border={0}
        rounded={{ base: 0, md: 'lg' }}
      >
        <ModalHeader alignItems='center' w='full' p={0}>
          <TopBar title='Update email address' hideBackButton />
        </ModalHeader>
        <ModalBody
          overflow='hidden'
          rounded={{ base: 0, md: 'lg' }}
          mb={6}
          mt={2}
        >
          <ModalCloseButton data-testid='update-email-close' />

          <VStack align='start' spacing={4}>
            <Text>
              After changing your email address you will need to login again
            </Text>
            <FormGenericError error={error} mb={0} pl={0} pb={0} />

            <form style={{ width: '100%' }} onSubmit={handleEmailUpdate}>
              <FormControl>
                <VStack align='start' gap={2}>
                  <VStack pb={2} w={'full'}>
                    <FormLabel alignSelf='start' fontSize='md'>
                      Email
                    </FormLabel>
                    <EmailEntry placeholder='New email address' size='md' />
                  </VStack>
                  <VStack pb={2} w={'full'}>
                    <FormLabel alignSelf='start' fontSize='md'>
                      Current password
                    </FormLabel>
                    <PasswordEntry
                      placeholder='Confirm current password'
                      size='md'
                    />
                  </VStack>
                  <Button
                    type='submit'
                    variant='primary'
                    size='lg'
                    isLoading={loading}
                    w='full'
                  >
                    Update email
                  </Button>
                </VStack>
              </FormControl>
            </form>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default EmailUpdateModal
