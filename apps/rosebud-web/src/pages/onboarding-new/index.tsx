import { ReactElement } from 'react'
import Layout from 'ui/global/Layout'
import Onboarding from 'ui/pages/onboarding'

const OnboardingPage = () => {
  return <Onboarding />
}

OnboardingPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout hideNav isWide>
      {page}
    </Layout>
  )
}

export default OnboardingPage
