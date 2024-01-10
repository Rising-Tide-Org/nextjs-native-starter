import { VStack, Flex, Tooltip, Button, Text } from '@chakra-ui/react'
import routes from 'lib/routes'
import moment from 'moment'
import EmptyPageState from 'ui/core/EmptyPageState'
import Panel from 'ui/core/Panel'
import SmallCapsHeading from 'ui/core/SmallCapsHeading'
import { RbShare } from 'ui/shared/Icon'
import WeekDetailEmptyState from '../WeekDetailEmptyState'
import NextLink from 'next/link'
import { Entry } from 'types/Entry'
import { Analysis } from 'types/Analysis'
import { useSubscriptionProvider } from 'providers/SubscriptionProvider'
import { CgLock } from 'react-icons/cg'
import { useMemo } from 'react'
import InsightCard from './InsightCard'
import { kMaxFreeWeeklyInsights } from 'constants/premium'

type Props = {
  week: string
  entries: Entry[]
  weeklySummary?: Analysis
  isLoading: boolean
  onRunAnalysis: () => void
  onShare: (type: string, text?: string) => void
}

const WeeklyAnalysisView = ({
  week,
  entries,
  weeklySummary,
  isLoading,
  onRunAnalysis,
  onShare,
}: Props) => {
  const { isSubscriptionActive, openSubscribeModal } = useSubscriptionProvider()

  // Prevent free users from creating summaries for previous weeks
  const needsPremium = useMemo(
    () =>
      !isSubscriptionActive &&
      moment(week, 'GGGG-WW').isBefore(moment().subtract(1, 'week'), 'week') &&
      !weeklySummary,
    [isSubscriptionActive, week, weeklySummary]
  )

  if (needsPremium) {
    return (
      <EmptyPageState
        icon={<CgLock size='48px' />}
        header='Journey back in time'
        label='Unlock previous weeks and their insights with Rosebud Premium.'
        afterElement={
          <Button
            variant='primary'
            onClick={() => openSubscribeModal('weeklyReflection')}
          >
            Upgrade &rarr;
          </Button>
        }
      />
    )
  }

  return (
    <>
      {entries.length < 3 ? (
        <EmptyPageState
          label='You need at least 3 entries to run an analysis for this week.'
          afterElement={
            <NextLink href={routes.compose()}>
              <Button variant='primary'>Write entry &rarr;</Button>
            </NextLink>
          }
        />
      ) : (
        <>
          {weeklySummary && !isLoading ? (
            <VStack align='start'>
              {weeklySummary?.summary && (
                <Panel bg='bgSecondary' w='full'>
                  <Flex justify='space-between'>
                    <SmallCapsHeading variant='highlight'>
                      Weekly Reflection
                    </SmallCapsHeading>
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
                        onClick={() => onShare('reflection')}
                      />
                    </Tooltip>
                  </Flex>
                  <Text whiteSpace='pre-wrap' data-sentry-block>
                    {weeklySummary?.summary?.trim()}
                  </Text>
                </Panel>
              )}

              {weeklySummary.insights?.length > 0 && (
                <>
                  <SmallCapsHeading pt={4} pb={2}>
                    💡 Key insights
                  </SmallCapsHeading>
                  {(weeklySummary.insights as string[])?.map(
                    (insight, index) => (
                      <InsightCard
                        key={index}
                        text={insight}
                        locked={
                          index + 1 > kMaxFreeWeeklyInsights &&
                          !isSubscriptionActive
                        }
                        onShare={() => onShare('insight', insight)}
                      />
                    )
                  )}
                </>
              )}
              {weeklySummary.wins && (
                <>
                  <SmallCapsHeading pt={4} pb={2}>
                    🏆 Weekly wins
                  </SmallCapsHeading>
                  {(weeklySummary.wins as string[])?.map((win, index) => (
                    <InsightCard
                      key={index}
                      text={win}
                      locked={
                        index + 1 > kMaxFreeWeeklyInsights &&
                        !isSubscriptionActive
                      }
                      onShare={() => onShare('win', win)}
                    />
                  ))}
                </>
              )}
            </VStack>
          ) : (
            <WeekDetailEmptyState
              week={week}
              onRunAnalysis={onRunAnalysis}
              isLoading={isLoading}
            />
          )}
        </>
      )}

      {weeklySummary?.createdAt?.seconds && (
        <Text
          mx='auto'
          mt={8}
          mb={{ base: 0, md: 8 }}
          fontSize='15px'
          color='brandGray.500'
          w='full'
          align='center'
        >
          Generated on{' '}
          {moment
            .unix(weeklySummary?.createdAt?.seconds)
            .format('MMMM Do, YYYY')}
        </Text>
      )}
    </>
  )
}

export default WeeklyAnalysisView
