import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  VStack,
  Button,
  IconButton,
  Spacer,
  useColorModeValue,
} from '@chakra-ui/react'
import { deleteRecordBatch, createRecordBatch } from 'db/mutate'
import { query, where } from 'firebase/firestore'
import useFetchMany from 'shared/hooks/useFetchMany'
import useFetchOne from 'shared/hooks/useFetchOne'
import routes from 'lib/routes'
import moment from 'moment'
import { summarizeTopicStream } from 'net/openai'
import { useRouter } from 'next/router'
import { useCallback, useState } from 'react'
import { MdRefresh } from 'react-icons/md'
import {
  CollectionItem,
  CollectionItemMilestone,
  CollectionItemTopic,
} from 'types/Collection'
import { Entry } from 'types/Entry'
import EmptyPageState from 'ui/core/EmptyPageState'
import { ListView } from 'ui/core/ListView'
import { ListViewItem } from 'ui/core/ListView/ListViewItem'
import Panel from 'ui/core/Panel'
import PartialJSONParser from 'util/json'
import MemoryListViewItem from '../MemoryListViewItem'
import TopicTimelineItem from './TopicTimelineItem'

type Props = {
  topicId: string
}

const TopicTimeline = ({ topicId }: Props) => {
  const router = useRouter()
  const [timelineExpanded, setTimelineExpanded] = useState(false)
  const [generatedMilestones, setGeneratedMilestones] = useState<
    CollectionItemMilestone[]
  >([])
  const [itemsLoading, setItemsLoading] = useState(false)

  const bgColor = useColorModeValue('gray.100', 'gray.800')
  const hoverBgColor = useColorModeValue('gray.200', 'gray.700')

  // Fetch the topic
  const { data: topic } = useFetchOne<CollectionItemTopic>('items', topicId, {
    subscribe: true,
  })

  // Fetch all the child items (milestones, prompts)
  const { data: milestones } = useFetchMany<CollectionItemMilestone>(
    'items',
    (q) =>
      query(
        q,
        where('parentId', '==', topicId),
        where('type', '==', 'milestone')
      ),
    { subscribe: true }
  )

  // Fetch all the entries that have this topic
  const { data: entries } = useFetchMany<Entry>(
    'entries',
    (q) => query(q, where('tagIndex', 'array-contains', topicId)),
    { subscribe: true }
  )

  const handleEntry = useCallback(
    (entry: Entry) => {
      router.push(routes.entry(entry.id!), undefined, { shallow: true })
    },
    [router]
  )

  const handleGenerateMilestones = useCallback(async () => {
    if (topic?.title) {
      setItemsLoading(true)
      setTimelineExpanded(true)
      // TODO: Make it so we only fetch new milestones from memory
      if (milestones?.length) {
        await deleteRecordBatch('items', milestones.map((m) => m.id!) ?? [])
      }

      const parser = new PartialJSONParser()
      const stream = summarizeTopicStream(
        topic.title,
        'milestones',
        (milestones) => {
          const parsedMilestones = parser.parse(milestones) as Record<
            string,
            any
          >[]
          if (!parsedMilestones?.length) return

          const sortedMilestones = sortMilestones(parsedMilestones)

          setGeneratedMilestones(sortedMilestones)
        },
        async (milestones) => {
          const parsedMilestones = parser.parse(milestones) as Record<
            string,
            any
          >[]

          if (!parsedMilestones?.length) return

          await createRecordBatch<CollectionItem>(
            'items',
            sortMilestones(parsedMilestones).map((m) => ({
              ...m,
              parentId: topic.id, // Make sure to add the parent id!
            }))
          )

          setItemsLoading(false)
        }
      )

      stream.start().catch((e) => {
        console.error(e)
        setItemsLoading(false)
      })
    }
  }, [milestones, topic])

  if (
    milestones === undefined ||
    entries === undefined ||
    topic === undefined
  ) {
    return null
  }

  const milestonesToShow =
    generatedMilestones.length > 0 ? generatedMilestones : milestones

  return (
    <Tabs>
      <TabList>
        <Tab>Timeline</Tab>
        <Tab>Entries</Tab>
        <Spacer />
        <IconButton
          icon={<MdRefresh size='18' />}
          aria-label='Refresh'
          variant='ghost'
          size='sm'
          onClick={handleGenerateMilestones}
          isLoading={itemsLoading}
          visibility={
            milestones?.length || milestonesToShow?.length
              ? 'visible'
              : 'hidden'
          }
        />
      </TabList>
      <TabPanels>
        <TabPanel px={0}>
          <VStack align='start'>
            {milestonesToShow?.length === 0 ? (
              <EmptyPageState
                header='Observe trends over time'
                label={
                  'Rosebud can scan your memories and generate a timeline for you.'
                }
                afterElement={
                  <Button
                    onClick={handleGenerateMilestones}
                    isLoading={itemsLoading}
                    loadingText='Generating timeline...'
                  >
                    Generate timeline
                  </Button>
                }
              />
            ) : (
              <>
                {milestonesToShow?.slice(0, 4).map((milestone, index) => (
                  <TopicTimelineItem key={index} milestone={milestone} />
                ))}
                {milestonesToShow && milestonesToShow.length > 4 && (
                  <>
                    {timelineExpanded && (
                      <>
                        {milestonesToShow?.slice(4).map((milestone, index) => (
                          <TopicTimelineItem
                            key={index}
                            milestone={milestone}
                          />
                        ))}
                      </>
                    )}

                    <Button
                      bg={bgColor}
                      _hover={{
                        bg: hoverBgColor,
                      }}
                      size='sm'
                      onClick={() => setTimelineExpanded(!timelineExpanded)}
                    >
                      {timelineExpanded ? 'Show less' : 'Show more'}
                    </Button>
                  </>
                )}
              </>
            )}
          </VStack>
        </TabPanel>
        <TabPanel px={0}>
          <Panel p={0}>
            {entries?.length === 0 ? (
              <EmptyPageState
                header='Related entries'
                label={'There seems to be nothing here'}
              />
            ) : (
              <ListView>
                {entries
                  ?.sort((a, b) => (b.date ?? '')?.localeCompare(a.date ?? ''))
                  .map((entry) => (
                    <ListViewItem
                      key={entry.id}
                      onClick={() => handleEntry(entry)}
                    >
                      <MemoryListViewItem entry={entry} />
                    </ListViewItem>
                  ))}
              </ListView>
            )}
          </Panel>
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}

/**
 * Sort milestones in descending order
 * @param milestones
 * @returns
 */
const sortMilestones = (milestones: Record<string, any>[]) =>
  [
    ...milestones.filter((m) => !m.milestone),
    ...milestones
      .filter((m) => m.milestone)
      .sort((a, b) => {
        return moment(a.date).isBefore(moment(b.date)) ? 1 : -1
      }),
  ].map((m) => convertMilestoneToItem(m))

/**
 * Convert the OpenAI JSON milestone to a CollectionItemMilestone
 * @param milestone openai json
 * @returns
 */
const convertMilestoneToItem = (
  milestone: Record<string, any>
): CollectionItemMilestone => ({
  type: 'milestone',
  content: milestone.milestone,
  metadata: {
    day: milestone.date,
  },
  emoji: milestone.emoji,
})

export default TopicTimeline
