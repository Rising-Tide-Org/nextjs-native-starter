import {
  VStack,
  Flex,
  TagLeftIcon,
  TagLabel,
  Divider,
  Box,
  Button,
  Link,
  Text,
} from '@chakra-ui/react'
import useIsMobile from 'shared/hooks/useIsMobile'
import useShareContent from 'shared/hooks/useShareContent'
import Analytics from 'lib/analytics'
import routes from 'lib/routes'
import moment from 'moment'
import { useNavigationProvider } from 'shared/providers/NavigationProvider'
import { BsFillPersonFill } from 'react-icons/bs'
import { Entry } from 'types/Entry'
import EmptyPageState from 'ui/core/EmptyPageState'
import Panel from 'ui/core/Panel'
import SmallCapsHeading from 'ui/core/SmallCapsHeading'
import { RbShare } from 'ui/shared/Icon'
import { hasEmoji } from 'util/string'
import JournalDetailView from '../../JournalDetailView'
import NextLink from 'next/link'
import { entryTopTagsByType } from 'util/entries'
import EntityTag from 'ui/pages/summary/SummaryView/SummaryEntities/EntityTag'

type Props = {
  groupKey: string
  entries: Entry[]
}

const WeeklySummaryView = ({ entries, groupKey }: Props) => {
  const { pushView } = useNavigationProvider()

  const isMobile = useIsMobile()
  const shareContent = useShareContent()

  const topTags = entryTopTagsByType(entries)
  const hasInsights = entries.some((e) => e.summary?.content?.length)

  /**
   * Distribute entries into two columns in a masonry layout
   */

  const insightColumns = (entries: Entry[]) => {
    const columns: Entry[][] = [[], []]

    const modulos = isMobile ? 1 : 2

    if (entries) {
      const filteredEntries = entries?.filter((e) => e.summary?.content?.length)
      for (let i = 0; i < filteredEntries.length; i++) {
        columns[i % modulos].push(filteredEntries[i])
      }
    }

    return columns
  }

  /**
   * Share an entry insight
   */
  const handleShareEntryInsight = (entry: Entry, text: string) => {
    Analytics.trackEvent('journal.weekly.share')
    const content = `Insight from my Rosebud entry on ${moment(
      entry.day
    ).format('dddd, MMMM Do')}\n\n${text.trim()}`

    shareContent({
      text: content?.trim() ?? '',
      source: 'insight-card',
    })
  }

  /**
   * Render a column of entries
   */
  const renderColumn = (column: Entry[]) =>
    column.map((entry) => {
      // TODO: We need to refactor this to be more flexible, but for now we'll just
      // split on the first instance of "Key insight:" or "Initial thought:"
      let keyInsight = entry.summary?.content?.split(
        /Key insight:|Initial thought:/i
      )[1]

      if (entry.templateId === 'reframing') {
        keyInsight = 'Initial thought: ' + keyInsight
      }
      const titleEmoji = entry.summary?.title.split(/\s/)[0] ?? ''

      return (
        <Panel key={entry.id} variant='vstack' pb={3} gap={3} bg='bgSecondary'>
          <Text lineHeight='1.5rem' whiteSpace='pre-wrap'>
            {keyInsight?.trim()}
          </Text>
          <Flex justify='space-between' align='center'>
            <Flex gap={2}>
              {hasEmoji(titleEmoji) ? titleEmoji : null}
              <Link
                as={NextLink}
                color='brandGray.600'
                fontSize='14px'
                href={routes.entry(entry.id!)}
                onClick={(e) => {
                  if (isMobile) {
                    e.preventDefault()
                    pushView(
                      <JournalDetailView entry={entry} groupKey={groupKey} />,
                      {
                        route: routes.entry(entry.id!),
                      }
                    )
                  }
                }}
              >
                {moment(entry.day).format('MMM Do')} &rarr;
              </Link>
            </Flex>

            <RbShare
              boxSize='18px'
              color='icon'
              _hover={{
                color: 'iconHover',
              }}
              cursor='pointer'
              onClick={() => handleShareEntryInsight(entry, keyInsight ?? '')}
            />
          </Flex>
        </Panel>
      )
    })

  return (
    <>
      {entries.length === 0 && (
        <EmptyPageState
          label='Here you can see an aggregate view of your entries and insights for this week.'
          border={0}
          afterElement={
            <NextLink href={routes.compose()}>
              <Button variant='primary'>Write first entry &rarr;</Button>
            </NextLink>
          }
        />
      )}
      <VStack align='start' gap={4}>
        {topTags.theme && (
          <Box>
            <SmallCapsHeading>Key Topics</SmallCapsHeading>
            <Flex flexWrap='wrap' gap={1}>
              {topTags.theme.slice(0, 5).map((tag, index) => (
                <EntityTag
                  key={index}
                  itemId={tag.tag.id!}
                  data-sentry-block
                  // TODO: this will be enabled once we launch Lifemap
                  navigable={false}
                >
                  <TagLabel>
                    {tag.tag.title}
                    {tag.count > 1 && ` x ${tag.count}`}
                  </TagLabel>
                </EntityTag>
              ))}
            </Flex>
          </Box>
        )}

        {topTags.person && (
          <Box>
            <SmallCapsHeading>Top Mentions</SmallCapsHeading>
            <Flex flexWrap='wrap' gap={1}>
              {topTags.person.slice(0, 5).map((tag, index) => (
                <EntityTag
                  key={index}
                  itemId={tag.tag.id!}
                  data-sentry-block
                  // TODO: this will be enabled once we launch Lifemap
                  navigable={false}
                >
                  <TagLeftIcon as={BsFillPersonFill} mr={1} />
                  <TagLabel>
                    {tag.tag.title}
                    {tag.count > 1 && ` x ${tag.count}`}
                  </TagLabel>
                </EntityTag>
              ))}
            </Flex>
          </Box>
        )}

        {topTags.emotion && (
          <Box>
            <SmallCapsHeading>Predominant Moods</SmallCapsHeading>
            <Flex flexWrap='wrap' gap={1}>
              {topTags.emotion.slice(0, 5).map((tag, index) => (
                <EntityTag
                  key={index}
                  itemId={tag.tag.id!}
                  data-sentry-block
                  // TODO: this will be enabled once we launch Lifemap
                  navigable={false}
                >
                  <TagLabel>
                    {tag.tag.title}
                    {tag.count > 1 && ` x ${tag.count}`}
                  </TagLabel>
                </EntityTag>
              ))}
            </Flex>
          </Box>
        )}
      </VStack>

      {hasInsights && (
        <>
          <Divider my={6} />
          <SmallCapsHeading>Entry Insights</SmallCapsHeading>
          <Flex direction='column' gap={2} flex={1}>
            {isMobile ? (
              <Flex direction='column' gap={2} flex={1}>
                {renderColumn(
                  entries.filter((e) => {
                    return e.summary?.content?.length
                  })
                )}
              </Flex>
            ) : (
              <Flex gap={2} w='full'>
                {insightColumns(entries).map((column, index) => (
                  <Flex key={index} direction='column' gap={2} flex={1}>
                    {renderColumn(column)}
                  </Flex>
                ))}
              </Flex>
            )}
          </Flex>
        </>
      )}
    </>
  )
}

export default WeeklySummaryView
