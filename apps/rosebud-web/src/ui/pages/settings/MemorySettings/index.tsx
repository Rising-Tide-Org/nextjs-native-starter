import {
  Box,
  Button,
  Flex,
  FlexProps,
  FormLabel,
  HStack,
  Icon,
  Spacer,
  Switch,
  Text,
  useToast,
} from '@chakra-ui/react'
import { PriceDiscoveryVariant } from 'constants/premium'
import { backfillVectorsPinecone } from 'net/pinecone'
import { useSubscriptionProvider } from 'providers/SubscriptionProvider'
import { useUserProvider } from 'providers/UserProvider'
import { useCallback, useState } from 'react'
import { BiErrorCircle } from 'react-icons/bi'
import { EntryChunkingMode } from 'types/EntryVector'
import MakeToast from 'ui/core/MakeToast'

type Props = FlexProps & {
  description?: string
}

const kDefaultDescription =
  'Rosebud can recall previous entries and use them to help you reflect more deeply.'

const MemorySettings = ({ description, ...props }: Props) => {
  const toast = useToast()
  const { user, updateUserFields, setUserVariant } = useUserProvider()
  const { hasMemoryFeature, openSubscribeModal } = useSubscriptionProvider()
  const [isVectorizing, setIsVectorizing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>()

  const vectorizeEntries = useCallback(async () => {
    if (!user.uuid) return

    setIsVectorizing(true)

    const res = await backfillVectorsPinecone()

    if (res.error) {
      setErrorMessage(res.error.message)

      toast(
        MakeToast({
          title: 'Error enabling memory',
          status: 'error',
        })
      )
    } else {
      await updateUserFields({
        'metadata.backfilledVectors': true,
        'settings.memoryEnabled': true,
        'settings.entryChunkingMode': EntryChunkingMode.PerQuestion,
      })

      toast(
        MakeToast({
          title: 'Memory enabled',
          status: 'success',
        })
      )
    }

    setIsVectorizing(false)
  }, [user.uuid, updateUserFields, toast])

  const handleMemoryEnabled = useCallback(
    async (memoryEnabled: boolean) => {
      await updateUserFields({
        'settings.memoryEnabled': memoryEnabled,
      })
    },
    [updateUserFields]
  )

  const handleUpgrade = async () => {
    // Make sure user will see Bloom price tier
    if (user.variants?.pricing !== PriceDiscoveryVariant.withDiscount) {
      await setUserVariant('pricing', PriceDiscoveryVariant.withDiscount)
    }

    openSubscribeModal('settingsMemory')
  }

  return (
    <Box>
      <Box>
        <Flex direction='column' align='start' gap={4} {...props}>
          <Text fontSize='md'>{description ?? kDefaultDescription}</Text>
          {!hasMemoryFeature ? (
            <Button variant='primary' onClick={() => handleUpgrade()}>
              Upgrade to Bloom
            </Button>
          ) : user.metadata?.backfilledVectors ? (
            <Flex width='full' justifyContent='start' {...props}>
              <HStack>
                <Switch
                  id='isEnabled'
                  colorScheme='brand'
                  variant='primary'
                  isChecked={user.settings.memoryEnabled}
                  size='lg'
                  onChange={(e) => handleMemoryEnabled(e.target.checked)}
                  alignContent='center'
                />

                <FormLabel htmlFor='isEnabled'>
                  {user.settings.memoryEnabled ? 'Enabled' : 'Disabled'}
                </FormLabel>
                <Spacer />
              </HStack>
            </Flex>
          ) : (
            <>
              {!errorMessage ? (
                <Button
                  variant='primary'
                  isLoading={isVectorizing}
                  loadingText='Indexing...'
                  onClick={vectorizeEntries}
                >
                  Enable Memory
                </Button>
              ) : (
                <Text
                  color='red.500'
                  display='flex'
                  alignItems='center'
                  gap={2}
                  lineHeight='1'
                >
                  <Icon w={5} h={5} as={BiErrorCircle} /> {errorMessage}
                </Text>
              )}
              {isVectorizing ? (
                <>
                  <Text fontStyle='italic'>
                    This might take a little while.
                  </Text>
                </>
              ) : null}
            </>
          )}
        </Flex>
      </Box>
    </Box>
  )
}

export default MemorySettings
