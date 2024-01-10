import { Box, Button, Link, Text, VStack } from '@chakra-ui/react'
import { useAuthProvider } from 'providers/AuthProvider'
import NextLink from 'next/link'
import { useSubscriptionProvider } from 'providers/SubscriptionProvider'

const CloudSyncSettings = () => {
  const { user: authUser } = useAuthProvider()
  const { openSubscribeModal, isSubscriptionActive } = useSubscriptionProvider()

  return (
    <Box>
      {authUser?.isAnonymous ? (
        <Box>
          <VStack align='start' spacing={4}>
            <Text fontSize='md'>
              Create an account to backup your journal and access it on all
              devices.
            </Text>
            <Link as={NextLink} href='/signup'>
              <Button variant='primary'>Create account</Button>
            </Link>
          </VStack>
        </Box>
      ) : (
        <VStack align='start' spacing={4}>
          {isSubscriptionActive ? (
            <Text fontSize='md'>
              Your journal is backed up and synced across all devices.
            </Text>
          ) : (
            <>
              <Text fontSize='md'>
                Free accounts can only be signed into one device at a time.
                Upgrade to sign in from multiple devices.
              </Text>
              <Button
                variant='primary'
                onClick={() => openSubscribeModal('settingsCloudSync')}
              >
                Upgrade to Premium
              </Button>
            </>
          )}
        </VStack>
      )}
    </Box>
  )
}

export default CloudSyncSettings
