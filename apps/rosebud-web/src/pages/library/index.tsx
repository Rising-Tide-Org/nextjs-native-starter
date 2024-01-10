import { NextPageContext } from 'next'
import { ReactElement } from 'react'
import Layout from 'ui/global/Layout'
import PromptsComponent from 'ui/pages/library'

type Props = {
  tabKey: string
}

const PromptsPage = ({ tabKey: tabKeyOffUrl }: Props) => {
  return <PromptsComponent tabKey={tabKeyOffUrl} />
}

PromptsPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout isWide>{page}</Layout>
}

export const getServerSideProps = (context: NextPageContext) => {
  const tabKey =
    typeof context.query.tab === 'string' ? context.query.tab : null

  return {
    props: {
      tabKey,
    },
  }
}

export default PromptsPage
