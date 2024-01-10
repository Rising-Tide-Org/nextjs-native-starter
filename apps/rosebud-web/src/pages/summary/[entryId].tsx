import Analytics from 'lib/analytics'
import { NextPageContext } from 'next'
import { ReactElement, useEffect } from 'react'
import Layout from 'ui/global/Layout'
import Summary from 'ui/pages/summary'

type Props = {
  entryId: string
  returnTo?: string
}

const SummaryPage = ({ entryId, returnTo }: Props) => {
  useEffect(() => {
    Analytics.trackEvent('summary.view')
  }, [])
  return <Summary entryId={entryId} returnTo={returnTo} />
}

SummaryPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout hideNav isWide>
      {page}
    </Layout>
  )
}

export async function getServerSideProps(context: NextPageContext) {
  const { entryId, returnTo } = context.query

  return {
    props: {
      entryId: entryId ?? null,
      returnTo: returnTo ?? null,
    },
  }
}

export default SummaryPage
