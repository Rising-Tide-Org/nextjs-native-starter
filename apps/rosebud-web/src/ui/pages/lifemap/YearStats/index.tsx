import {
  Box,
  Grid,
  Stat as ChakraStat,
  StatLabel,
  StatNumber,
  Text,
} from '@chakra-ui/react'
import useFetchOne from 'hooks/useFetchOne'
import moment from 'moment'
import { CollectionItemTopic } from 'types/Collection'
import { Stat } from 'types/Stat'
import { Streak } from 'types/Streak'
import Panel from 'ui/core/Panel'
import ExportYearStats from './ExportYearStats'

type Props = {
  groupedTopics: Record<string, CollectionItemTopic[] | undefined>
}

const YearStats = ({ groupedTopics }: Props) => {
  const { data: streak } = useFetchOne<Streak>('streaks', 'daily')
  const { data: stats } = useFetchOne<Stat>('stats', 'yearly-2023', {
    subscribe: true,
  })

  const sinceDate = streak?.completions.sort(
    (a, b) => a.date.seconds - b.date.seconds
  )[0]?.date.seconds

  if (!stats) return null

  return (
    <Box w='full'>
      <ExportYearStats
        sinceDate={sinceDate}
        stats={stats}
        groupedTopics={groupedTopics}
      />
      {sinceDate && (
        <Text color='brandGray.500' textAlign='center'>
          Since {moment.unix(sinceDate).format('MMMM Do YYYY')}
        </Text>
      )}
      <Grid
        paddingTop={{ base: 4, md: 8 }}
        gridGap={2}
        gridTemplateColumns={{
          base: 'repeat(2, 1fr)',
          md: 'repeat(4, 1fr)',
        }}
      >
        <ChakraStat>
          <Panel>
            <StatLabel>Longest streak</StatLabel>
            <StatNumber>🔥 {stats.longestStreak ?? 0}</StatNumber>
          </Panel>
        </ChakraStat>
        <ChakraStat>
          <Panel>
            <StatLabel>Entries</StatLabel>
            <StatNumber>{stats.entries}</StatNumber>
          </Panel>
        </ChakraStat>
        <ChakraStat>
          <Panel>
            <StatLabel>Words written</StatLabel>
            <StatNumber>{stats.words.toLocaleString('en-us')}</StatNumber>
          </Panel>
        </ChakraStat>
        <ChakraStat>
          <Panel>
            <StatLabel>Goals completed</StatLabel>
            <StatNumber>
              {stats.goalsCompleted.toLocaleString('en-us')}
            </StatNumber>
          </Panel>
        </ChakraStat>
      </Grid>
    </Box>
  )
}

export default YearStats
