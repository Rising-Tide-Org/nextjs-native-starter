import { ReactElement } from 'react'
import Layout from 'ui/global/Layout'
import SubscriptionCancel from 'ui/pages/subscription/cancel'

const SubscriptionCancelPage = () => {
  return <SubscriptionCancel />
}

SubscriptionCancelPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout hideNav isWide>
      {page}
    </Layout>
  )
}

export default SubscriptionCancelPage
