import { NextPageContext } from 'next'
import { ReactElement } from 'react'
import Layout from 'ui/global/Layout'
import Settings from 'ui/pages/settings'

type Props = {
  returnTo?: string
}

const SettingsPage = ({ returnTo }: Props) => {
  return <Settings returnTo={returnTo} />
}

SettingsPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>
}

export const getServerSideProps = (context: NextPageContext) => {
  const { returnTo } = context.query

  return {
    props: {
      returnTo: returnTo ?? null,
    },
  }
}

export default SettingsPage
