import { initializeAdmin } from 'db-server'
import { fetchOne } from 'db-server/fetch'
import Analytics from 'lib/analytics'
import { NextPageContext } from 'next'
import { useUserProvider } from 'providers/UserProvider'
import { ReactElement, useEffect } from 'react'
import { Entry } from 'types/Entry'
import Layout from 'ui/global/Layout'
import Compose from 'ui/pages/compose'
import OnboardingCTA from 'ui/pages/onboarding/OnboardingCTA'
import { getUserIdFromContext } from 'util/firebase'
import router from 'next/router'

type Props = {
  templateId: string
  draft?: Entry
  before?: number
  after?: number
  returnTo?: string
}

const kTemplateId = 'new-year-2024'

const EntryPage = ({ templateId, draft, before, after, returnTo }: Props) => {
  const { user } = useUserProvider()

  useEffect(() => {
    const { utm_campaign, utm_medium, utm_source } = router.query

    Analytics.trackEvent('welcome.view', {
      templateId: kTemplateId,
      utm_campaign,
      utm_medium,
      utm_source,
    })
  }, [])

  if (!user.id) {
    return (
      <OnboardingCTA
        buttonLabel='Create your resolutions'
        subHeadingText="Make 2024 your best year yet with our New Year's Resolutions journal!"
      />
    )
  }

  return (
    <Compose
      templateId={templateId}
      draft={draft}
      before={before}
      after={after}
      returnTo={returnTo}
    />
  )
}

EntryPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout hideNav isWide isMobileFullHeight>
      {page}
    </Layout>
  )
}

export const getServerSideProps = async (context: NextPageContext) => {
  const { draft: draftId, before, after } = context.query
  let draft: Entry | null = null

  if (draftId) {
    const userId = await getUserIdFromContext(context)

    if (userId) {
      const db = (await initializeAdmin()).firestore()
      const { data: fetchedDraft } = await fetchOne<Entry>(
        db,
        'drafts',
        draftId as string,
        userId
      )

      if (fetchedDraft) {
        draft = fetchedDraft
      }
    }
  }

  return {
    props: {
      templateId: kTemplateId,
      draft,
      before: before ?? null,
      after: after ?? null,
      returnTo: '/home',
    },
  }
}

export default EntryPage
