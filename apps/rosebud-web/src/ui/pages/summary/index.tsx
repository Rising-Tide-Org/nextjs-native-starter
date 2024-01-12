import useFetchOne from 'shared/hooks/useFetchOne'
import routes from 'lib/routes'
import { NavigationProvider } from 'providers/NavigationProvider'
import { SummaryProvider } from 'providers/SummaryProvider'
import { Entry } from 'types/Entry'
import ComposeContainer from '../compose/ComposeContainer'
import SummaryView from './SummaryView'

type Props = {
  entryId: string
  returnTo?: string
}

const Summary = ({ entryId, returnTo }: Props) => {
  const { data: entry } = useFetchOne<Entry>('entries', entryId)

  if (!entry) {
    return null
  }

  return (
    <SummaryProvider entry={entry} returnTo={returnTo}>
      <ComposeContainer overflow='hidden' position='relative'>
        <NavigationProvider
          rootView={<SummaryView />}
          baseRoute={routes.composeSummary(entryId, returnTo)}
          allowDesktop
        />
      </ComposeContainer>
    </SummaryProvider>
  )
}

export default Summary
