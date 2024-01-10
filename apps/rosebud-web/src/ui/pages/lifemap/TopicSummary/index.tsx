import {
  Box,
  Editable,
  EditablePreview,
  EditableTextarea,
  Flex,
  IconButton,
  Skeleton,
} from '@chakra-ui/react'
import useFetchOne from 'hooks/useFetchOne'
import { CollectionItemTopic } from 'types/Collection'
import ResizeTextarea from 'react-textarea-autosize'
import { updateRecord } from 'db/mutate'
import { useState, useCallback, useEffect, useRef } from 'react'
import SmallCapsHeading from 'ui/core/SmallCapsHeading'
import { MdRefresh } from 'react-icons/md'
import { summarizeTopic } from 'net/openai'
import { serverTimestamp } from 'firebase/firestore'

type Props = {
  topicId: string
}

const TopicSummary = ({ topicId }: Props) => {
  const [summaryLoading, setSummaryLoading] = useState(false)
  const summaryLoadedRef = useRef(false)

  const { data: topic } = useFetchOne<CollectionItemTopic>('items', topicId, {
    subscribe: true,
  })

  const [editableText, setEditableText] = useState<string>(
    topic?.description ?? ''
  )

  useEffect(() => {
    if (
      !summaryLoadedRef.current &&
      topic &&
      !topic?.metadata.lastPageGeneration
    ) {
      handleGenerateSummary()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic])

  const handleGenerateSummary = useCallback(async () => {
    if (topic?.title) {
      try {
        setSummaryLoading(true)
        summaryLoadedRef.current = true

        const { response: description } = await summarizeTopic<string>(
          topic.title,
          'description'
        )

        await updateRecord<CollectionItemTopic>(
          'items',
          topic.id!,
          {},
          {
            description,
            ['metadata.lastPageGeneration']: serverTimestamp(),
          }
        )
        setSummaryLoading(false)
      } catch (error) {
        console.error(error)
        setSummaryLoading(false)
      }
    }
  }, [topic])

  useEffect(() => {
    setEditableText(topic?.description ?? '')
  }, [topic?.description])

  const updateSummary = useCallback(
    (value?: string) => {
      updateRecord<CollectionItemTopic>(
        'items',
        topic!.id!,
        {},
        {
          description: value,
        }
      )
    },
    [topic]
  )

  if (!topic) return null

  return (
    <Box>
      <Flex align='top' justify='space-between'>
        <SmallCapsHeading mb={0}>Summary</SmallCapsHeading>
        <IconButton
          icon={<MdRefresh size='18' />}
          aria-label='Refresh'
          variant='ghost'
          size='sm'
          onClick={handleGenerateSummary}
          isLoading={summaryLoading}
          mt='-8px'
          visibility={topic.description ? 'visible' : 'hidden'}
        />
      </Flex>
      {summaryLoading ? (
        <>
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Skeleton
                key={i}
                height='20px'
                mb={1}
                startColor='brandGray.300'
                endColor='brandGray.400'
              />
            ))}
        </>
      ) : (
        <Editable
          onSubmit={updateSummary}
          value={editableText}
          placeholder={`Summarize what ${topic.title} means to you...`}
          onChange={(nextValue) => setEditableText(nextValue)}
          data-sentry-block
          flex={1}
          selectAllOnFocus={false}
        >
          <EditablePreview
            w='full'
            whiteSpace='pre-wrap'
            opacity={topic.description ? 1 : 0.4}
          />
          <EditableTextarea
            as={ResizeTextarea}
            minRows={1}
            pb={0}
            mb='-2.5px'
            whiteSpace='pre-wrap'
            overflow='hidden'
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.metaKey) {
                e.preventDefault()
                const textarea = e.target as HTMLTextAreaElement
                textarea.blur()
              }
            }}
          />
        </Editable>
      )}
    </Box>
  )
}

export default TopicSummary
