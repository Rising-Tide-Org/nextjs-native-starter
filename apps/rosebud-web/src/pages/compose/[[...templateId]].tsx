import { Box } from '@chakra-ui/react'
import { initializeAdmin } from 'db-server'
import { fetchOne } from 'db-server/fetch'
import { NextPageContext } from 'next'
import { ReactElement } from 'react'
import { Entry } from 'types/Entry'
import Layout from 'ui/global/Layout'
import Compose from 'ui/pages/compose'
import { getUserIdFromContext } from 'util/firebase'

type Props = {
  templateId: string
  draft?: Entry
  before?: number
  after?: number
  returnTo?: string
}

const EntryPage = ({ templateId, draft, before, after, returnTo }: Props) => {
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
    <Layout hideNav isWide>
      <Box>{page}</Box>
    </Layout>
  )
}

export const getServerSideProps = async (context: NextPageContext) => {
  const { templateId, draft: draftId, returnTo, before, after } = context.query
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
      templateId: templateId?.[0] ?? null,
      draft,
      before: before ?? null,
      after: after ?? null,
      returnTo: returnTo ?? null,
    },
  }
}

export default EntryPage
