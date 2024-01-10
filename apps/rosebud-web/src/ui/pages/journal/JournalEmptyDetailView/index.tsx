import { VStack, Grid } from '@chakra-ui/react'
import { kJournals } from 'constants/templates'
import Analytics from 'lib/analytics'
import { useEffect, useMemo } from 'react'
import { ComposeTemplateMetadata } from 'types/Compose'
import { Entry } from 'types/Entry'
import SmallCapsHeading from 'ui/core/SmallCapsHeading'
import JournalCard from 'ui/pages/library/GuidedJournals/JournalCard'
import { rankTemplates } from 'util/template'

type Props = {
  entries: Entry[]
}

const JournalEmptyDetailView = ({ entries }: Props) => {
  useEffect(() => {
    Analytics.trackEvent('journal.empty.view')
  }, [])

  const rankedJournals: ComposeTemplateMetadata[] = useMemo(
    () => rankTemplates(entries ?? [], kJournals),
    [entries]
  )

  return (
    <VStack align='start'>
      <SmallCapsHeading>Start with a guided journal</SmallCapsHeading>
      <Grid
        gridTemplateColumns={['repeat(2, 1fr)', 'repeat(3, 1fr)']}
        gridGap={2}
      >
        {rankedJournals.map((journal) => (
          <JournalCard key={journal.templateId} journal={journal} />
        ))}
      </Grid>
    </VStack>
  )
}

export default JournalEmptyDetailView
