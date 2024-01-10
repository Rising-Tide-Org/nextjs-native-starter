import { Box, Flex, IconButton, Skeleton } from '@chakra-ui/react'
import { deleteRecordBatch, createRecordBatch } from 'db/mutate'
import { query, where } from 'firebase/firestore'
import useFetchMany from 'hooks/useFetchMany'
import useFetchOne from 'hooks/useFetchOne'
import { generateTopicPrompts } from 'net/openai'
import { useCallback, useEffect, useRef, useState } from 'react'
import { MdRefresh } from 'react-icons/md'
import { Swiper, SwiperSlide } from 'swiper/react'
import { CollectionItem, CollectionItemTopic } from 'types/Collection'
import SmallCapsHeading from 'ui/core/SmallCapsHeading'
import PromptCard from 'ui/pages/home/LaunchPad/PromptCard'

type Props = {
  topicId: string
}

const TopicPrompts = ({ topicId }: Props) => {
  const promptsLoadedRef = useRef(false)
  const [promptsGenerating, setPromptsGenerating] = useState(false)

  // Fetch all the child items (milestones, prompts)
  const { data: prompts } = useFetchMany<CollectionItem>(
    'items',
    (q) =>
      query(q, where('parentId', '==', topicId), where('type', '==', 'prompt')),
    { subscribe: true }
  )

  // Fetch the topic
  const { data: topic } = useFetchOne<CollectionItemTopic>('items', topicId, {
    subscribe: true,
  })

  useEffect(() => {
    if (!promptsLoadedRef.current && prompts?.length === 0) {
      handleGeneratePrompts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompts?.length])

  const handleGeneratePrompts = useCallback(async () => {
    if (topic?.id && topic?.title) {
      try {
        promptsLoadedRef.current = true
        setPromptsGenerating(true)

        const { response: newPrompts } = await generateTopicPrompts(topic.title)
        const promises = []

        if (prompts && prompts.length > 0) {
          promises.push(
            deleteRecordBatch(
              'items',
              prompts
                ?.filter((p) => !p.metadata?.isBookmarked)
                .map((prompt) => prompt.id!) ?? []
            )
          )
        }

        const items = (newPrompts?.map((prompt) => ({
          parentId: topic.id,
          type: 'prompt',
          content: prompt,
        })) ?? []) as CollectionItem[]

        promises.push(createRecordBatch<CollectionItem>('items', items))
        await Promise.all(promises)

        promptsLoadedRef.current = false
        setPromptsGenerating(false)
      } catch (error) {
        console.error(error)
        setPromptsGenerating(false)
        promptsLoadedRef.current = false
      }
    }
  }, [prompts, topic?.id, topic?.title])

  return (
    <Box>
      <Flex align='center' justify='space-between' mb={3}>
        <SmallCapsHeading mb={0}>Journaling Prompts</SmallCapsHeading>
        <IconButton
          icon={<MdRefresh size='18' />}
          aria-label='Refresh'
          variant='ghost'
          size='sm'
          onClick={handleGeneratePrompts}
          isLoading={promptsGenerating}
          visibility={prompts?.length === 0 ? 'hidden' : 'visible'}
        />
      </Flex>
      <Box h='240px' mb={4}>
        <Swiper
          style={{
            zIndex: 0,
            overflowY: 'hidden',
            minWidth: 0,
            width: '100%',
            maxWidth: '100%',
            minHeight: 0,
            maxHeight: '100%',
          }}
          mousewheel={{
            forceToAxis: true,
          }}
          cssMode
          spaceBetween={6}
          slidesPerView='auto'
          slidesPerGroup={2}
          onSwiper={(swiper) => {
            // Disable vertical scrolling
            swiper.wrapperEl.style.overflowY = 'hidden'
          }}
        >
          {promptsGenerating &&
            Array(5)
              .fill(0)
              .map((_, index) => (
                <SwiperSlide
                  key={index}
                  style={{ width: 'fit-content', height: '240px' }}
                >
                  <Skeleton
                    w='240px'
                    h='240px'
                    rounded='md'
                    startColor='brandGray.300'
                    endColor='brandGray.400'
                    speed={1}
                  />
                </SwiperSlide>
              ))}
          {prompts?.slice(0, 5).map((prompt, index) => (
            <SwiperSlide
              key={index}
              style={{ width: 'fit-content', height: '240px' }}
            >
              <PromptCard
                size='sm'
                prompt={{
                  id: prompt.id!,
                  type: 'personal',
                  question: prompt.content ?? '',
                }}
                showBookmark={false}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
    </Box>
  )
}

export default TopicPrompts
