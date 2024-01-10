import React, { ReactElement } from 'react'
import { useRouter } from 'next/router'
import navigator from 'lib/routes'
import { useUserProvider } from 'providers/UserProvider'
import PageLoading from 'ui/global/PageLoading'
import Layout from 'ui/global/Layout'

import { useAuthProvider } from 'providers/AuthProvider'
import OnboardingCTA from 'ui/pages/onboarding/OnboardingCTA'
import { UserFlag } from 'types/User'

const IndexPage = () => {
  const router = useRouter()
  const { user: authUser } = useAuthProvider()
  const { user } = useUserProvider()

  if (authUser === undefined) {
    return <PageLoading />
  } else if (authUser === null) {
    return <OnboardingCTA />
  } else if (user) {
    if (!user.flags?.[UserFlag.onboardingComplete]) {
      router.replace(navigator.onboarding + window.location.search, undefined, {
        shallow: true,
      })
    } else {
      router.replace(navigator.home)
    }
  }
}

IndexPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout hideNav isWide isMobileFullHeight>
      {page}
    </Layout>
  )
}

export default IndexPage
