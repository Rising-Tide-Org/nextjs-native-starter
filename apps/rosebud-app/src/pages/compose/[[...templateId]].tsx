import { Box } from '@chakra-ui/react'
import { fetchOne } from 'db/fetch'
import { useRouter } from 'next/router'
import { ReactElement, useEffect } from 'react'
import { Entry } from 'types/Entry'
import Layout from 'ui/global/Layout'
import Compose from 'ui/pages/compose'
import { getQueryParam } from 'util/url'

const EntryPage = () => {
  const router = useRouter()

  const templateId = getQueryParam(router.query, 'templateId')

  const draftId = getQueryParam(router.query, 'draft')
  let draft: Entry | undefined = undefined

  const before = parseInt(getQueryParam(router.query, 'before') ?? '')
  const after = parseInt(getQueryParam(router.query, 'after') ?? '')
  const returnTo = getQueryParam(router.query, 'returnTo') ?? undefined

  useEffect(() => {
    const fetchDraft = async (draftId: string) => {
      const fetchedDraft = await fetchOne<Entry>('drafts', draftId)
      if (fetchedDraft) draft = fetchedDraft
    }

    if (draftId) {
      fetchDraft(draftId)
    }
  }, [draftId])

  if (!templateId) return null

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

// export const getServerSideProps = async (context: NextPageContext) => {
//   const { templateId, draft: draftId, returnTo, before, after } = context.query
//   let draft: Entry | null = null

//   if (draftId) {
//     const userId = await getUserIdFromContext(context)

//     if (userId) {
//       const db = (await initializeAdmin()).firestore()
//       const { data: fetchedDraft } = await fetchOne<Entry>(
//         db,
//         'drafts',
//         draftId as string,
//         userId,
//       )

//       if (fetchedDraft) {
//         draft = fetchedDraft
//       }
//     }
//   }

//   return {
//     props: {
//       templateId: templateId?.[0] ?? null,
//       draft,
//       before: before ?? null,
//       after: after ?? null,
//       returnTo: returnTo ?? null,
//     },
//   }
// }

export default EntryPage
