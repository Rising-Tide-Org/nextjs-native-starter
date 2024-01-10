// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { captureException as sentryCaptureException } from '@sentry/nextjs'
import { fetchMemories } from 'lib/pinecone'
import withMiddleware from 'middleware'
import { NextAuthApiRequest } from 'middleware/tokenVerification'
import { NextApiResponse } from 'next'
import { ComposeResponse } from 'types/Compose'
import { Entry } from 'types/Entry'

const handler = async (req: NextAuthApiRequest, res: NextApiResponse) => {
  try {
    const { responses, topK, query, memoryRange } = JSON.parse(req.body)

    const userId = req._user!.id!
    const userUuid = req._user!.uuid!
    const finalQuery = responses
      ? (responses as ComposeResponse[]).map((r) => r.response[0]).join('\n')
      : query

    let memories: Entry[] = []
    if (userId && userUuid && finalQuery) {
      memories = await fetchMemories(
        userId,
        userUuid,
        finalQuery,
        topK,
        memoryRange
      )
    }

    res.status(200).json({ response: { memories } })
  } catch (error) {
    sentryCaptureException(error)
    console.error(error)
    return res.status(500).json({ error: { message: 'Internal error' } })
  }
}

export default withMiddleware({
  methods: ['POST'],
  authenticated: true,
})(handler)
