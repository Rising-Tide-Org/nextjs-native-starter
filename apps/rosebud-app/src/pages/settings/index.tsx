import { useRouter } from 'next/router'
import { ReactElement } from 'react'
import Layout from 'ui/global/Layout'
import Settings from 'ui/pages/settings'
import { getQueryParam } from 'util/url'

const SettingsPage = () => {
  const router = useRouter()
  const returnTo = getQueryParam(router.query, 'returnTo') ?? undefined

  return <Settings returnTo={returnTo} />
}

SettingsPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>
}

export default SettingsPage
