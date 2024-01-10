import { Button, FormLabel, useToast, VStack } from '@chakra-ui/react'
import navigator from 'lib/routes'
import { firebaseAuth } from 'db'
import { sendPasswordResetEmail } from 'firebase/auth'
import { useAuthProvider } from 'providers/AuthProvider'
import MakeToast from 'ui/core/MakeToast'
import { useState } from 'react'

const PasswordUpdate = () => {
  const { user: authUser } = useAuthProvider()

  const [isSent, setIsSent] = useState(false)

  const toast = useToast()

  const handleClick = () => {
    if (!authUser?.email) {
      return
    }

    sendPasswordResetEmail(firebaseAuth, authUser.email, {
      // Sending them to sign out as we want to clear whatever session they have and redirect to sign in link after
      url: `https://my.rosebud.app/${navigator.signout}`,
      handleCodeInApp: false,
    })
      .then(() => {
        setIsSent(true)
        toast(
          MakeToast({
            title: 'Password email sent',
            duration: 5000,
            description:
              'Check your inbox for a password reset email. Check spam too.',
          })
        )
      })
      .catch((error) => {
        console.error(error)
        toast(
          MakeToast({
            title: 'Error sending password reset email',
            duration: 5000,
            description: 'Try again. If this persists, please contact support.',
          })
        )
      })
  }
  return (
    <VStack align='start' spacing={3}>
      <FormLabel alignSelf='start' fontSize='md' fontWeight={400}>
        Password
      </FormLabel>
      <Button
        onClick={handleClick}
        variant='outline'
        size='sm'
        isDisabled={isSent}
      >
        {isSent ? 'Email sent' : 'Reset password'}
      </Button>
    </VStack>
  )
}

export default PasswordUpdate
