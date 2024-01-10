import {
  ChatCompletionCreateParams,
  ChatCompletionMessageParam,
} from 'openai/resources'
import { OpenAIStream } from 'net/openai/stream'
import { getGPTModelForStream } from 'util/models-server-edge'
import { NextResponse } from 'next/server'
import withStreamMiddleware, {
  NextAuthRequest,
} from 'middleware/withStreamMiddleware'
import { createStreamedApiReponse } from 'util/openai'

export const config = {
  runtime: 'edge',
}

const handler = async (req: NextAuthRequest): Promise<Response> => {
  let messages
  try {
    const json = (await req.json()) as {
      messages: ChatCompletionMessageParam[]
    }
    messages = json.messages
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
  }

  const model = getGPTModelForStream('passThru', req._user)
  const request: ChatCompletionCreateParams = {
    model,
    temperature: 0.7,
    messages: [
      {
        role: 'system',
        content:
          'You are a friendly coach and therapist. Your goal is to help the user self reflect. Keep questions short and concise. Only ask questions. Use "you" instead of "I".',
      },
      ...messages,
    ],
  }

  const stream = await OpenAIStream(request)

  return createStreamedApiReponse(stream, model)
}

export default withStreamMiddleware(handler)
