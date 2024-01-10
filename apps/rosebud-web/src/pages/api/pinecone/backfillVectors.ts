import { Pinecone } from '@pinecone-database/pinecone'
import { captureException as sentryCaptureException } from '@sentry/nextjs'
import { deleteVectorsForUser, indexEntries } from 'lib/pinecone'
import { NextApiResponse } from 'next'
import withMiddleware from 'middleware'
import { NextAuthApiRequest } from 'middleware/tokenVerification'
import AnalyticsServer from 'lib/analytics-server'
import { Entry } from 'types/Entry'
import { initializeAdmin } from 'db-server'
import { fetchMany } from 'db-server/fetch'

const handler = async (req: NextAuthApiRequest, res: NextApiResponse) => {
  try {
    const userUuid = req._user?.uuid
    const userId = req._user?.id
    if (!userUuid || !userId) {
      return res.status(401).json({ error: { message: 'User not found' } })
    }

    // Initialize Firebase Admin & Firestore
    const app = await initializeAdmin()
    const db = await app.firestore()

    const { data: entries } = await fetchMany<Entry>(
      db,
      'entries',
      (q) => q,
      userId
    )
    if (!entries?.length) {
      return res.status(422).json({ error: { message: 'No entries found' } })
    }

    const client = new Pinecone()
    await deleteVectorsForUser(userUuid)
    const vectorCount = await indexEntries(client, userUuid, entries)
    res.status(200).json({})

    AnalyticsServer.trackEvent(req._user!.id!, 'memory.index.success', {
      entryCount: (entries as Entry[]).length,
      vectorCount,
      backfill: true,
    })
  } catch (error) {
    res.status(500).json({ error: { message: 'Internal error' } })
    sentryCaptureException(error)
    AnalyticsServer.trackEvent(req._user!.id!, 'memory.index.error', {
      error: JSON.stringify(error),
    })
  }
}

export default withMiddleware({
  methods: ['POST'],
  authenticated: true,
})(handler)
