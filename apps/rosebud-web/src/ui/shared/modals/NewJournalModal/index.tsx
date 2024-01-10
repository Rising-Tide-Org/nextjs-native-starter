import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  useDisclosure,
  ModalCloseButton,
  useTheme,
  Text,
  Box,
  Flex,
  VStack,
  Divider,
  Button,
  Badge,
} from '@chakra-ui/react'

import { useUserProvider } from 'providers/UserProvider'
import { useEffect } from 'react'
import { AiOutlineBulb } from 'react-icons/ai'
import { UserFlag } from 'types/User'
import TopBar from 'ui/global/TopBar'
import ComposeSettings from 'ui/pages/settings/ComposeSettings'
import { RbMicrophone, RbModeInteractive } from 'ui/shared/Icon'

const NewJournalModal = () => {
  const { zIndices, colors } = useTheme()
  const { user, setUserFlag } = useUserProvider()
  const { isOpen, onClose, onOpen } = useDisclosure()

  useEffect(() => {
    if (user && !user?.flags?.[UserFlag.newJournalModalDismissed]) {
      setUserFlag(UserFlag.newJournalModalDismissed, true)
      onOpen()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      preserveScrollBarGap
      closeOnOverlayClick={false}
      motionPreset='slideInBottom'
      autoFocus={true}
      size={{ base: 'full', md: 'md' }}
    >
      <ModalOverlay />
      <ModalContent rounded='md' overflow='hidden'>
        <ModalCloseButton zIndex={zIndices.sticky} />
        <ModalBody p={0}>
          <TopBar hideBackButton={true} title="✨ What's New" />
          <Box p={0}>
            <Box p={4} overflow='hidden' position='relative'>
              <Box zIndex={2}>
                <VStack align='start' rounded='md' spacing={5} mt={4}>
                  <FeatureBox
                    color='brandGray.100'
                    icon={
                      <RbModeInteractive boxSize='20px' color='brand.500' />
                    }
                    title='Interactive journaling mode'
                    description='Like talking to your own personal coach'
                  />
                  <FeatureBox
                    color='brandGray.100'
                    icon={<AiOutlineBulb size='20px' fill={colors.blue[500]} />}
                    title='Enlighten me'
                    description='Stuck? Get tips and guidance'
                  />
                  <FeatureBox
                    color='brandGray.100'
                    icon={<RbMicrophone boxSize='20px' color='green.500' />}
                    title='Voice dictation'
                    isPremium
                    description='Type with your voice'
                  />
                </VStack>
              </Box>
            </Box>

            <Divider my={4} mx={4} />

            <Text
              size='sm'
              fontWeight={500}
              textTransform='uppercase'
              fontSize='12px'
              color='brandGray.500'
              px={4}
              mt={6}
            >
              Choose your journaling mode
            </Text>
            {user?.settings?.journalMode && (
              <ComposeSettings journalMode={user.settings.journalMode} />
            )}

            <Flex px={4} justify='center'>
              <Button size='lg' variant='primary' w='full' onClick={onClose}>
                Continue
              </Button>
            </Flex>

            <Text p={4} align='center' fontSize='sm' color='brandGray.500'>
              You can change this in Settings at any time
            </Text>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

const FeatureBox = ({
  icon,
  title,
  description,
  color,
  isPremium,
}: {
  icon: React.ReactNode
  title: string
  description: string
  color: string
  isPremium?: boolean
}) => (
  <Box>
    <Flex gap={3} align='center'>
      <Flex
        bg={color}
        rounded='md'
        w='44px'
        h='44px'
        align='center'
        justify='center'
      >
        {icon}
      </Flex>
      <Box>
        <Flex align='center' w='full' gap={2}>
          <Text fontWeight={500} fontSize='16px'>
            {title}
          </Text>
          {isPremium && (
            <Badge colorScheme='green' h='fit-content'>
              Premium
            </Badge>
          )}
        </Flex>
        <Text fontSize='15px' color='brandGray.500'>
          {description}
        </Text>
      </Box>
    </Flex>
  </Box>
)

export default NewJournalModal
