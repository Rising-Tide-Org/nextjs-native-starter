import { Skeleton, VStack } from '@chakra-ui/react'
import { createRecordBatch, deleteRecordBatch } from 'db/mutate'
import { query, where } from 'firebase/firestore'
import useFetchMany from 'hooks/useFetchMany'
import useFetchOne from 'hooks/useFetchOne'
import Analytics from 'lib/analytics'
import { summarizeTopic } from 'net/openai'
import { useRouter } from 'next/router'
import { AskProvider } from 'providers/AskProvider'
import { useState, useCallback, useRef, useEffect } from 'react'
import { AskItem, AskDisplayMode } from 'types/Ask'
import { CollectionItem, CollectionItemTopic } from 'types/Collection'
import AskRosebud from 'ui/pages/home/AskRosebud'

type Props = {
  topicId: string
  displayMode?: AskDisplayMode
}

const TopicAskRosebud = ({ topicId, displayMode }: Props) => {
  const [itemsLoading, setItemsLoading] = useState(false)
  const router = useRouter()
  const asksLoadedRef = useRef(false)

  // Fetch the topic
  const { data: topic } = useFetchOne<CollectionItemTopic>('items', topicId, {
    subscribe: true,
  })

  const asks = useFetchMany<AskItem>('items', (q) =>
    query(q, where('parentId', '==', topicId), where('type', '==', 'ask'))
  ).data

  useEffect(() => {
    if (!asksLoadedRef.current && asks?.length === 0) {
      handleGenerateAsks()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asks?.length])

  const handleGenerateAsks = useCallback(async () => {
    if (topic?.title && !asksLoadedRef.current) {
      try {
        setItemsLoading(true)
        asksLoadedRef.current = true

        await deleteRecordBatch('items', asks?.map((ask) => ask.id!) ?? [])

        const { response } = await summarizeTopic<string>(topic.title, 'ask')

        const parsed = JSON.parse(response ?? '[]') as string[]

        setItemsLoading(false)

        if (parsed?.length) {
          await createRecordBatch<CollectionItem>(
            'items',
            parsed.map((ask) => ({
              parentId: topic.id,
              type: 'ask',
              content: ask,
            }))
          )
        }
      } catch (error) {
        Analytics.trackEvent('lifemap.topic.generateAsks.error', {
          error: error.message,
        })
        console.error(error)
        setItemsLoading(false)
      }
    }
  }, [topic, asks])

  if (!topic) {
    return null
  }

  return (
    <AskProvider parentId={topic.id}>
      <AskRosebud
        topicTitle={topic.title}
        displayMode={displayMode}
        returnTo={router.asPath}
      />
      {itemsLoading && (
        <VStack align='start' w='full'>
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Skeleton
                key={i}
                height='18px'
                width={`${80 + Math.random() * 10}%`}
                rounded='md'
                startColor='brandGray.300'
                endColor='brandGray.400'
              />
            ))}
        </VStack>
      )}
    </AskProvider>
  )
}

export default TopicAskRosebud
