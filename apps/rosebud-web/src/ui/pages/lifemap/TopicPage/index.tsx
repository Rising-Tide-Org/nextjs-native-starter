import {
  Button,
  Divider,
  Flex,
  Heading,
  Icon,
  Spinner,
  VStack,
} from '@chakra-ui/react'
import useFetchOne from 'shared/hooks/useFetchOne'
import { CollectionItemTopic } from 'types/Collection'
import { useCallback } from 'react'
import { kViewPadding } from 'shared/ui/constants'
import { FiChevronLeft } from 'react-icons/fi'
import { useRouter } from 'next/router'
import TopicSummary from '../TopicSummary'
import TopicPrompts from './TopicPrompts'
import TopicTimeline from './TopicTimeline'
import TopicAskRosebud from './TopicAskRosebud'

type Props = {
  topicId: string
  returnTo: string | null
}

const TopicPage = ({ topicId, returnTo }: Props) => {
  const router = useRouter()

  // Fetch the topic
  const { data: topic } = useFetchOne<CollectionItemTopic>('items', topicId, {
    subscribe: true,
  })

  const handleBack = useCallback(() => {
    if (returnTo) {
      router.push(returnTo)
    } else {
      router.back()
    }
  }, [returnTo, router])

  if (!topic) {
    return (
      <Flex
        justifyContent='center'
        alignItems='center'
        pt={8}
        flexDir='column'
        gap={4}
        minHeight='100%'
      >
        <Spinner size='md' />
      </Flex>
    )
  }

  return (
    <Flex direction='column' padding={kViewPadding}>
      <Flex
        justify='space-between'
        w='full'
        align='center'
        pb={5}
        mt={kViewPadding}
      >
        <Flex align='center'>
          <Button
            variant='link'
            p={0}
            minW={'none'}
            pr={1}
            onClick={handleBack}
          >
            <Icon as={FiChevronLeft} w={6} h={7} />
          </Button>
          <Heading as='h1' fontSize='20px' fontWeight={600}>
            {topic.title}
          </Heading>
        </Flex>
      </Flex>
      <Divider borderColor='brandGray.300' mb={6} />

      <Flex
        gap={10}
        justify='space-between'
        w='full'
        direction={{ base: 'column', xl: 'row' }}
      >
        <Flex
          position='relative'
          flexGrow={1}
          maxW={{ base: 'full', xl: '650px' }}
          direction='column'
          gap={4}
        >
          <TopicSummary topicId={topic.id!} />
          <VStack flex={1} display={{ base: 'flex', xl: 'none' }}>
            <TopicAskRosebud topicId={topic.id!} displayMode='lite' />
          </VStack>
          <TopicPrompts topicId={topic.id!} />
          <TopicTimeline topicId={topic.id!} />
        </Flex>

        <VStack
          align='start'
          flex={1}
          flexShrink={0}
          display={{ base: 'none', xl: 'flex' }}
        >
          <TopicAskRosebud topicId={topic.id!} />
        </VStack>
      </Flex>
    </Flex>
  )
}

export default TopicPage
