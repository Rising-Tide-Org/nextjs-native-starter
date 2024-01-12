import {
  VStack,
  Text,
  Box,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Flex,
  useToast,
  Tooltip,
} from '@chakra-ui/react'
import { kMinWordsForReflection } from 'constants/defaults'
import { fetchOne } from 'db/fetch'
import { updateRecord } from 'db/mutate'
import useIsMobile from 'shared/hooks/useIsMobile'
import useMutate from 'shared/hooks/useMutate'
import useShareContent from 'shared/hooks/useShareContent'
import Analytics from 'lib/analytics'
import routes from 'lib/routes'
import moment from 'moment'
import { useRouter } from 'next/router'
import { useEntryProvider } from 'providers/EntryProvider'
import { useNavigationProvider } from 'shared/providers/NavigationProvider'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { CollectionItem } from 'types/Collection'
import { Entry } from 'types/Entry'
import { kiOSBottomPadding } from 'shared/ui/constants'
import MakeToast from 'ui/core/MakeToast'
import Panel from 'ui/core/Panel'
import SmallCapsHeading from 'ui/core/SmallCapsHeading'
import NavigationBar from 'ui/global/Navigation/NavigationBar'
import SummaryBottomBar from 'ui/pages/summary/SummaryView/SummaryBottomBar'
import SummaryEntities from 'ui/pages/summary/SummaryView/SummaryEntities'
import { RbShare } from 'ui/shared/Icon'
import { isIOS, isPWAInstalled } from 'util/device'
import { entryWordCount, getEntryAsMarkdown } from 'util/entries'
import JournalDetailActions from './JournalDetailActions'
import JournalDetailActionsDraft from './JournalDetailActionsDraft'
import JournalDetailTitle from './JournalDetailTitle'
import { downloadFile } from 'util/fs'

type Props = {
  entry: Entry
  groupKey?: string
}

const JournalDetailView = ({ entry, groupKey }: Props) => {
  const { deleteEntry } = useEntryProvider()
  const { popView } = useNavigationProvider()
  const shareContent = useShareContent()
  const router = useRouter()
  const isMobile = useIsMobile()
  const toast = useToast()
  const { deleteRecord: deleteDraft } = useMutate<Entry>('drafts')
  const [reward, setReward] = useState<CollectionItem | null>()

  const isDraftItem = groupKey === 'drafts'

  const templateType = useMemo(() => {
    if (
      entry.templateId &&
      (entry.templateId.startsWith('ask-') ||
        entry.templateId.startsWith('prompt-'))
    ) {
      return entry.templateId.split('-')[0]
    } else {
      return entry.templateId
    }
  }, [entry.templateId])

  useEffect(() => {
    const date = moment(entry.date).format('YYYY-MM-DD')

    if (isDraftItem) {
      Analytics.trackEvent('journal.draft.view', {
        template: templateType,
        date,
      })
    } else {
      Analytics.trackEvent('journal.entry.view', {
        template: templateType,
        date,
      })
    }
  }, [entry.date, isDraftItem, templateType])

  /**
   * Share the entire summary and key insight
   */
  const handleShare = (type: 'analysis' | 'entry' | string, text?: string) => {
    Analytics.trackEvent('journal.entry.share', {
      template: templateType,
      type,
      date: moment(entry.date).format('YYYY-MM-DD'),
    })
    text = text?.trim()

    const content = (() => {
      switch (type) {
        case 'entry':
          return `${
            entry.summary?.title ? `${entry.summary.title}\n` : ''
          }${moment(entry.date).format('dddd, MMMM Do')}\n\n${entry.questions
            .map(
              (q) =>
                `${q.prompt.content.join('\n')}\n\n${q.response?.join('\n')}`
            )
            .join('\n\n')}`

        case 'analysis':
          return `${entry.summary?.title ? `${entry.summary.title}\n\n` : ''}${
            entry.summary?.content ?? ''
          }`

        case 'reflection':
          return `Reflection from my Rosebud entry on ${moment(
            entry.date
          ).format('dddd, MMMM Do')}\n\n${text}`

        case 'insight':
          return `Insight from my Rosebud entry on ${moment(entry.date).format(
            'dddd, MMMM Do'
          )}\n\n${text}`

        default:
          return text
      }
    })()

    shareContent({
      text: content?.trim() ?? '',
      source: 'entry-' + type,
    })
  }

  const handleExport = async () => {
    const fileName = `rosebud-entry-${moment(entry.date).format(
      'YYYY-MM-DD_HH-mm-ss'
    )}.md`

    try {
      downloadFile(fileName, getEntryAsMarkdown(entry))
      Analytics.trackEvent('journal.entry.export.success')
      toast(
        MakeToast({
          title: 'Export complete',
          status: 'success',
        })
      )
    } catch (e) {
      Analytics.trackEvent('journal.entry.export.error')
      toast(
        MakeToast({
          title: 'Export error',
          status: 'error',
        })
      )
    }
  }

  /**
   * Delete this entry
   */
  const handleDeleteEntry = useCallback(() => {
    if (!entry.id) {
      return null
    }
    deleteEntry(entry.id)

    toast(
      MakeToast({
        title: 'Entry deleted',
      })
    )

    Analytics.trackEvent('journal.entry.delete', {
      template: templateType,
      date: moment(entry.date).format('YYYY-MM-DD'),
    })

    popView()
  }, [deleteEntry, entry.date, entry.id, popView, templateType, toast])

  /**
   * Delete this draft
   */
  const handleDeleteDraft = useCallback(() => {
    if (!entry.id) {
      return null
    }
    deleteDraft(entry.id)

    toast(
      MakeToast({
        title: 'Draft deleted',
      })
    )

    Analytics.trackEvent('journal.draft.delete', {
      template: templateType,
      date: moment(entry.date).format('YYYY-MM-DD'),
    })

    popView()
  }, [deleteDraft, entry.date, entry.id, popView, templateType, toast])

  const handleContinueWriting = useCallback(() => {
    if (!entry.id) {
      return null
    }

    const templateId =
      entry.templateId === 'blank' ? undefined : entry.templateId
    const urlParams = new URLSearchParams(window.location.search)
    const onlyPath = router.asPath.split('?')[0]

    Analytics.trackEvent('journal.draft.continue', {
      template: templateType,
      date: moment(entry.date).format('YYYY-MM-DD'),
    })

    router.push(
      `${
        templateId
          ? routes.composeTemplate(
              templateId,
              `${onlyPath}?${urlParams.toString()}`
            )
          : routes.compose(`${onlyPath}?${urlParams.toString()}`)
      }&draft=${entry.id}`
    )
  }, [entry.date, entry.id, entry.templateId, router, templateType])

  /**
   * Regenrate the summary for this entry
   */
  const handleGenerateSummary = useCallback(() => {
    if (!entry.id) {
      return null
    }
    router.push(routes.composeSummary(entry.id, router.asPath))
  }, [entry.id, router])

  /**
   * Update the title of this entry
   */
  const handleUpdateTitle = useCallback(
    (title?: string) => {
      if (!entry.id || title === entry.summary?.title) {
        return null
      }
      updateRecord<Entry>('entries', entry.id, {}, { 'summary.title': title })
    },
    [entry.id, entry.summary?.title]
  )

  // Set entry reward (if exists)
  useEffect(() => {
    setReward(null)

    async function fetchReward(rewardId: string) {
      const reward = await fetchOne<CollectionItem>('items', rewardId)
      setReward(reward)
    }
    if (entry.rewardId) {
      fetchReward(entry.rewardId)
    }
  }, [entry.rewardId])

  // For some reason sometimes the content is not a string
  const hasSummary = Boolean(
    (entry.summary?.title || entry.summary?.content) &&
      typeof entry.summary?.content === 'string' &&
      typeof entry.summary?.title === 'string'
  )
  const hasCommitments = Boolean(entry.commitments?.length)

  const summaryParts = hasSummary
    ? entry.summary?.content?.split(/Key insight:|Initial thought:|Mantra:/i)
    : []
  const summaryContent = summaryParts?.[0]
  const summaryKeyInsight = summaryParts?.[1]

  const actionComponent = (
    <JournalDetailActions
      onShare={handleShare}
      onExport={handleExport}
      onDeleteEntry={handleDeleteEntry}
      onDeleteDraft={handleDeleteDraft}
      onGenerateSummary={handleGenerateSummary}
      canGenerateSummary={
        !entry.summary && entryWordCount(entry) > kMinWordsForReflection
      }
      hasSummary={hasSummary}
      isDraft={isDraftItem}
    />
  )

  const draftActionComponent = (
    <JournalDetailActionsDraft
      onDeleteDraft={handleDeleteDraft}
      onContinueDraft={handleContinueWriting}
    />
  )

  return (
    <>
      <NavigationBar
        rightAction={isDraftItem ? draftActionComponent : actionComponent}
      />
      <VStack
        w='100%'
        spacing={2}
        align='start'
        rounded='md'
        data-testid='entry-card'
        px={{ base: 4, md: 2 }}
        py={{ base: 2, md: 0 }}
        position='relative'
      >
        <Flex w='full'>
          <JournalDetailTitle
            title={entry.summary?.title ?? 'Untitled'}
            onSave={handleUpdateTitle}
            isDisabled={isDraftItem}
          />
          {!isMobile && (
            <Box h='30px'>
              {isDraftItem ? draftActionComponent : actionComponent}
            </Box>
          )}
        </Flex>

        <Text variant='tertiary' fontSize='15px' pb={3}>
          {moment(entry.date).format('dddd, MMMM Do @ h:mm a')}
        </Text>

        {hasCommitments && (
          <Box pb={4}>
            <SmallCapsHeading fontSize='11px' variant={'tertiary'}>
              New commitments
            </SmallCapsHeading>
            <VStack align='start'>
              {entry.commitments &&
                [...entry.commitments].map((commitment, index) => (
                  <Text key={index} data-sentry-block fontSize='15px'>
                    {commitment}
                  </Text>
                ))}
            </VStack>
          </Box>
        )}
        <Tabs position='relative' w='full' isLazy>
          <TabList>
            {hasSummary && (
              <Tab data-testid='entry-card-summary-tab'>Analysis</Tab>
            )}
            <Tab data-testid='entry-card-entry-tab'>Entry</Tab>
          </TabList>
          <TabPanels>
            {hasSummary && (
              <TabPanel px={0}>
                <VStack gap={2}>
                  <Panel w='full' bg='bgSecondary'>
                    <Flex justify='space-between'>
                      <SmallCapsHeading>Entry Reflection</SmallCapsHeading>

                      <Tooltip
                        label='Share reflection'
                        shouldWrapChildren
                        openDelay={1000}
                      >
                        <RbShare
                          mt='-8px'
                          boxSize='18px'
                          color='icon'
                          _hover={{
                            color: 'iconHover',
                          }}
                          cursor='pointer'
                          onClick={() =>
                            handleShare('reflection', summaryContent)
                          }
                        />
                      </Tooltip>
                    </Flex>
                    <Text whiteSpace='pre-wrap' data-sentry-block>
                      {summaryContent?.trim()}
                    </Text>
                  </Panel>
                  {summaryKeyInsight && (
                    <Panel w='full' bg='bgSecondary'>
                      <Flex justify='space-between' align='top'>
                        <SmallCapsHeading flex={1}>
                          {entry.templateId === 'reframing'
                            ? '🧠 Reframed Thought'
                            : entry.templateId === 'new-year-2024'
                            ? '🌟 Mantra'
                            : '💡 Key Insight'}
                        </SmallCapsHeading>
                        <Tooltip
                          label='Share insight'
                          shouldWrapChildren
                          openDelay={1000}
                        >
                          <RbShare
                            mt='-8px'
                            boxSize='18px'
                            color='icon'
                            _hover={{
                              color: 'iconHover',
                            }}
                            cursor='pointer'
                            onClick={() =>
                              handleShare('insight', summaryKeyInsight)
                            }
                          />
                        </Tooltip>
                      </Flex>
                      <Text whiteSpace='pre-wrap' data-sentry-block>
                        {entry.templateId === 'reframing' &&
                          'Initial thought: '}
                        {summaryKeyInsight.trim().replace('\n', '')}
                      </Text>
                    </Panel>
                  )}
                  {reward?.content && (
                    <Panel w='full' bg='bgSecondary'>
                      <Flex justify='space-between' align='top'>
                        <SmallCapsHeading flex={1}>
                          {'🏆 ' + reward.type}
                        </SmallCapsHeading>
                        <Tooltip
                          label={`Share ${reward.type}`}
                          shouldWrapChildren
                          openDelay={1000}
                        >
                          <RbShare
                            mt='-8px'
                            boxSize='18px'
                            color='icon'
                            _hover={{
                              color: 'iconHover',
                            }}
                            cursor='pointer'
                            onClick={() =>
                              handleShare(reward.type, reward?.content)
                            }
                          />
                        </Tooltip>
                      </Flex>
                      <Text whiteSpace='pre-wrap' data-sentry-block>
                        {reward.content.trim()}
                      </Text>
                    </Panel>
                  )}
                  {entry.tags && entry.id && (
                    <SummaryEntities
                      // TODO: this will be enabled once we launch Lifemap
                      navigable={false}
                      animate={false}
                      entryId={entry.id}
                      entities={entry.tags}
                      source='journalDetailView'
                    />
                  )}
                </VStack>
              </TabPanel>
            )}
            <TabPanel>
              <EntryPrompts entry={entry} />
            </TabPanel>
          </TabPanels>
        </Tabs>
        {isDraftItem ? (
          <SummaryBottomBar
            containerProps={{
              boxShadow: { base: 'inherit', md: 'none' },
              position: { base: 'fixed', md: 'static' },
              bottom: isPWAInstalled() && isIOS() ? kiOSBottomPadding : 0,
              left: 0,
            }}
            onClick={handleContinueWriting}
            data-testid='continue-writing-button'
          >
            Continue Writing
          </SummaryBottomBar>
        ) : null}
      </VStack>
    </>
  )
}

const EntryPrompts = ({ entry }: Props) => (
  <VStack align='start' gap={4} data-sentry-block>
    {[...entry.questions].map((question, index) => (
      <VStack key={index} align='start'>
        <Text
          variant='highlight'
          data-testid={`entry-card-question-${index}`}
          whiteSpace='pre-wrap'
        >
          {question.prompt.content.join('\n')}
        </Text>
        <Text data-testid={`entry-card-answer-${index}`} whiteSpace='pre-wrap'>
          {question.response.join('\n')}
        </Text>
      </VStack>
    ))}
  </VStack>
)

export default JournalDetailView
