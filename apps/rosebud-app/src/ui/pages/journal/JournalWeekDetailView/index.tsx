import {
  Box,
  Flex,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useToast,
} from '@chakra-ui/react'
import { captureException as sentryCaptureException } from '@sentry/nextjs'
import { kMaxContextWindowCharacters } from 'constants/limits'
import { kGPTModelMap } from 'constants/models'
import { createRecord, updateRecord } from 'db/mutate'
import { serverTimestamp, Timestamp } from 'firebase/firestore'
import useShareContent from 'hooks/useShareContent'
import Analytics, { AnalyticsProps } from 'lib/analytics'
import moment from 'moment'
import { compressEntries, weeklyReportStream } from 'net/openai'
import { useUserProvider } from 'providers/UserProvider'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Analysis } from 'types/Analysis'
import { Entry } from 'types/Entry'
import MakeToast from 'ui/core/MakeToast'
import NavigationBar from 'ui/global/Navigation/NavigationBar'
import NavigationBarButton from 'ui/global/Navigation/NavigationBar/NavigationBarButton'
import { RbShare } from 'ui/shared/Icon'
import {
  entryWordCount,
  formatEntriesForWeeklyReport,
  getWeekLabel,
} from 'util/entries'
import PartialJSONParser from 'util/json'
import { getGPTModelForStream } from 'util/models-server-edge'
import JournalDetailTitle from '../JournalDetailView/JournalDetailTitle'
import WeeklyAnalysisView from './WeeklyAnalysisView'
import WeeklySummaryView from './WeeklySummaryView'

type Props = {
  groupKey: string
  entries: Entry[]
  analysis?: Analysis
}

const JournalWeekDetailView = ({ groupKey, entries, analysis }: Props) => {
  const { user } = useUserProvider()
  const toast = useToast()
  const shareContent = useShareContent()

  const [weeklySummary, setWeeklySummary] = useState<Analysis | undefined>(
    analysis
  )
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Update weekly summary when analysis changes,
   * e.g. when a user navigates between summaries.
   */
  useEffect(() => {
    setWeeklySummary(analysis)
  }, [analysis])

  const weekLabel = useMemo(
    () => getWeekLabel(moment(groupKey, 'GGGG-WW').toDate()),
    [groupKey]
  )

  const nonRelativeWeekLabel = useMemo(
    () => getWeekLabel(moment(groupKey, 'GGGG-WW').toDate(), false),
    [groupKey]
  )

  useEffect(() => {
    Analytics.trackEvent('journal.weekly.view', {
      week: nonRelativeWeekLabel,
    })
  }, [nonRelativeWeekLabel])

  /**
   * Handles sharing of all elements of the weekly summary
   */
  const handleShare = useCallback(
    (
      type: 'analysis' | 'reflection' | 'insight' | 'win' | string,
      text?: string
    ) => {
      Analytics.trackEvent('journal.weekly.share', {
        type,
        week: nonRelativeWeekLabel,
      })
      text = text?.trim()

      const content = (() => {
        switch (type) {
          case 'analysis':
            return `${
              weeklySummary?.title
            }\n${weekLabel}\n\n${weeklySummary?.summary?.trim()}\n\nKey insights:\n\n${(
              weeklySummary?.insights as string[]
            )?.join('\n')}\n\nWeekly wins:\n\n${(
              weeklySummary?.wins as string[]
            )?.join('\n')}}`
          case 'reflection':
            return `${
              weeklySummary?.title
            }\n${weekLabel}\n\n${weeklySummary?.summary?.trim()}`
          case 'insight':
            return `Insight from my week on Rosebud:\n\n${text}`
          case 'win':
            return `My weekly win from Rosebud:\n\n${text}`
          default:
            return text
        }
      })()

      shareContent({
        text: content?.trim() ?? '',
        source: 'weekly-' + type,
      })
    },
    [shareContent, weekLabel, weeklySummary]
  )

  const handleUpdateTitle = useCallback(
    async (title?: string) => {
      const recordId = `weekly-${groupKey}`
      updateRecord<Analysis>('analysis', recordId, {
        title,
      })
    },
    [groupKey]
  )

  if (!entries) {
    return null
  }

  const entryCount = entries.length
  const wordCount = entryWordCount(entries)

  const runAnalysis = async () => {
    Analytics.trackEvent('weeklyReport.run')

    try {
      const parser = new PartialJSONParser()

      setIsLoading(true)

      let compressedEntries = ''
      const model = getGPTModelForStream('weeklyReport', user)
      const entriesCharCount = formatEntriesForWeeklyReport(entries).length

      if (entriesCharCount > kMaxContextWindowCharacters[model]) {
        try {
          const resp = await compressEntries(entries)
          // AK: the fetchNextApi function used in compressEntries seems to be messed up.
          // should be returning an ApiResponse<string> not a string.
          compressedEntries = resp as string
        } catch (e) {
          setIsLoading(false)
          toast(
            MakeToast({
              id: 'entry-compress-error',
              title: 'There was an issue analyzing your entries',
              description: 'Please try again later',
              status: 'error',
              duration: 5000,
            })
          )
          sentryCaptureException(
            new Error(`Error returned by /api/compressEntries: ${e}`)
          )
          return
        }
      }

      const { start } = weeklyReportStream(
        entries,
        compressedEntries,
        (data: string) => {
          const response = parser.parse(data) as Analysis

          if (response.title) {
            setIsLoading(false)
          }

          setWeeklySummary(response)
        },
        async (data: string) => {
          const response = parser.parse(data) as Analysis
          const recordId = `weekly-${groupKey}`
          await createRecord<Analysis>(
            'analysis',
            {
              ...response,
              type: 'weekly',
              entryIds: entries.map((e) => e.id),
              createdAt: serverTimestamp(),
            },
            recordId
          )

          setWeeklySummary((prev) => ({
            ...prev,
            type: 'weekly',
            createdAt: serverTimestamp() as Timestamp,
          }))

          Analytics.trackEvent(
            'weeklyReport.success',
            AnalyticsProps.openAiUsageProps(
              entries,
              data.length,
              // Note this doesn't account for entry compression
              kGPTModelMap.weeklyReport
            )
          )
        }
      )
      await start()
    } catch (e) {
      Analytics.trackEvent('weeklyReport.error', {
        error: e.message?.replace('\n', ''),
      })
      setIsLoading(false)
    }
  }

  return (
    <>
      <NavigationBar
        rightAction={
          weeklySummary?.summary ? (
            <NavigationBarButton
              icon={<RbShare boxSize='20px' />}
              onClick={() => handleShare('analysis')}
              aria-label='Share weekly analysis'
            />
          ) : null
        }
      />
      <Box
        mt={{ base: 2, md: 0 }}
        w='full'
        px={{ base: 4, md: 2 }}
        py={{ base: 2, md: 0 }}
      >
        <Flex w='full'>
          <JournalDetailTitle
            title={
              weeklySummary?.title?.trim() ||
              getWeekLabel(moment(groupKey, 'GGGG-WW').toDate())
            }
            isDisabled={!weeklySummary}
            onSave={handleUpdateTitle}
          />
        </Flex>

        <Flex fontSize='15px' gap={2} color='brandGray.500' mb={3}>
          {Boolean(weeklySummary?.title) && (
            <>
              <Text>{getWeekLabel(moment(groupKey, 'GGGG-WW').toDate())}</Text>
              &middot;
            </>
          )}
          <Text>{wordCount.toLocaleString('en-us')} words</Text>
          &middot;
          <Text>
            {entryCount}
            {entryCount === 1 ? ' entry' : ' entries'}
          </Text>
        </Flex>

        <Tabs position='relative' w='full' isLazy>
          <TabList>
            <Tab>Analysis</Tab>
            <Tab>Summary</Tab>
          </TabList>
          <TabPanels>
            <TabPanel px={0}>
              <WeeklyAnalysisView
                entries={entries}
                week={groupKey}
                weeklySummary={weeklySummary}
                isLoading={isLoading}
                onRunAnalysis={runAnalysis}
                onShare={handleShare}
              />
            </TabPanel>
            <TabPanel px={0}>
              <WeeklySummaryView entries={entries} groupKey={groupKey} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </>
  )
}

export default JournalWeekDetailView
