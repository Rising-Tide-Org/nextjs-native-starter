import Analytics from 'lib/analytics'
import { ReactElement, useEffect } from 'react'
import Layout from 'ui/global/Layout'
import SubscriptionComponent from 'ui/pages/subscription'

const SubscriptionPage = () => {
  useEffect(() => {
    Analytics.trackEvent('subscription.view')
  }, [])

  return <SubscriptionComponent />
}

SubscriptionPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>
}

export default SubscriptionPage
