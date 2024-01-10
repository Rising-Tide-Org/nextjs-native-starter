import { Pinecone } from '@pinecone-database/pinecone'
import { captureException as sentryCaptureException } from '@sentry/nextjs'
import { indexEntries } from 'lib/pinecone'
import { NextApiResponse } from 'next'
import withMiddleware from 'middleware'
import { NextAuthApiRequest } from 'middleware/tokenVerification'
import AnalyticsServer from 'lib/analytics-server'
import { Entry } from 'types/Entry'

const handler = async (req: NextAuthApiRequest, res: NextApiResponse) => {
  try {
    const { entries } = JSON.parse(req.body)

    const userUuid = req._user!.uuid!

    const client = new Pinecone()
    const vectorCount = await indexEntries(client, userUuid, entries)
    res.status(200).json({})

    AnalyticsServer.trackEvent(req._user!.id!, 'memory.index.success', {
      entryCount: (entries as Entry[]).length,
      vectorCount,
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
