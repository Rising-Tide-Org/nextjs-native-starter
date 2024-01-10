import routes from 'lib/routes'
import { NextPageContext } from 'next'
import { NavigationProvider } from 'providers/NavigationProvider'
import { ReactElement } from 'react'
import Layout from 'ui/global/Layout'
import JournalComponent from 'ui/pages/journal'

type Props = {
  query?: string
}

const JournalPage = ({ query }: Props) => {
  return (
    <NavigationProvider
      rootView={<JournalComponent query={query} />}
      baseRoute={routes.journal}
    />
  )
}

JournalPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout isWide>{page}</Layout>
}

export const getServerSideProps = (context: NextPageContext) => {
  const { q } = context.query

  return {
    props: {
      query: q ?? null,
    },
  }
}

export default JournalPage
