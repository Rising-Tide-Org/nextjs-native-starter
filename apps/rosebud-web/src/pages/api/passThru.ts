import { NextApiResponse } from 'next'
import { captureException } from '@sentry/nextjs'
import { getGPTModel } from 'util/models-server'
import withMiddleware from 'middleware'
import { NextAuthApiRequest } from 'middleware/tokenVerification'
import {
  ChatCompletionCreateParams,
  ChatCompletionMessageParam,
} from 'openai/resources'
import OpenAI from 'openai'

const handler = async (req: NextAuthApiRequest, res: NextApiResponse) => {
  const messages = JSON.parse(req.body)
    ?.messages as ChatCompletionMessageParam[]

  try {
    const openaiApi = new OpenAI()
    const model = getGPTModel('passThru', req._user!)
    const request: ChatCompletionCreateParams = {
      model,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content:
            'You are a friendly coach and therapist. Your goal is to help the user self reflect. Keep questions short and concise. Only ask questions. Use "you" instead of "I".',
        },
        ...messages,
      ],
    }

    const completion = await openaiApi.chat.completions.create(request)

    // Set the model this endpoint is ran with in the response header
    res.setHeader('X-Model-Used', model)

    if (!completion.choices?.[0]?.message?.content) {
      res.status(500).json({ error: 'No response from AI' })
      return null
    }

    const content = completion.choices?.[0]?.message?.content

    res.status(200).json({
      response: content,
    })
  } catch (error) {
    console.error(error)
    captureException(error)
    res.status(500).json({ error: { message: error.message } })
  }
}

export default withMiddleware({
  methods: ['POST'],
  authenticated: true,
})(handler)
