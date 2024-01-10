import { useRouter } from 'next/router'
import { ReactElement } from 'react'
import Layout from 'ui/global/Layout'
import TopicPage from '../../ui/pages/lifemap/TopicPage'
import LifemapPage from 'ui/pages/lifemap'
import routes from 'lib/routes'
import { NextPageContext } from 'next'

type Props = {
  returnTo: string | null
}

const Review = ({ returnTo }: Props) => {
  const router = useRouter()

  const queryId = router.query.id as string
  const topicId = queryId ? decodeURIComponent(queryId) : null

  if (topicId) {
    return <TopicPage topicId={topicId} returnTo={returnTo} />
  }

  return <LifemapPage />
}

Review.getLayout = function getLayout(page: ReactElement) {
  return <Layout isWide>{page}</Layout>
}

export async function getServerSideProps(context: NextPageContext) {
  const { returnTo } = context.query

  return {
    props: {
      returnTo: returnTo ?? routes.review,
    },
  }
}

export default Review
