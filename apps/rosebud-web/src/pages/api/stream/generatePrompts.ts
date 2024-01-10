// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Entry } from 'types/Entry'
import {
  ChatCompletionCreateParams,
  ChatCompletionMessageParam,
} from 'openai/resources'
import { OpenAIStream } from 'net/openai/stream'
import { formatEntriesForChatCompletion } from 'util/entries'
import { getGPTModelForStream } from 'util/models-server-edge'
import { NextResponse } from 'next/server'
import withStreamMiddleware, {
  NextAuthRequest,
} from 'middleware/withStreamMiddleware'
import { trackOpenAiUsage } from 'lib/edge/mixpanel'
import { User } from 'types/User'
import { createStreamedApiReponse } from 'util/openai'

export const config = {
  runtime: 'edge',
}

const kFunctionName = 'generatePrompts'

const handler = async (req: NextAuthRequest): Promise<Response> => {
  let entries
  let user: User

  try {
    user = req._user!
    const json = (await req.json()) as { entries: Entry[] }
    entries = json.entries
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
  }

  const model = getGPTModelForStream(kFunctionName, user)
  const messages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content:
        "You are a supportive and gentle conversational partner. Your goal is to gently guide the user into deeper self exploration. Start slow and easy. Do not use conjunctions such as 'and', 'or', or 'but'. Always respond with a numbered list.",
    },
    ...formatEntriesForChatCompletion(entries),
    {
      role: 'system',
      content: `Based on the conversation so far, generate three standalone, simple yet thought-provoking questions. Each question should explore the user's perspective, highlight unique elements, or suggesting unseen patterns or connections. Start slow and easy. Diversify the focus across the questions while staying on topic. Keep each question succinct but meaningful. Each question should be less than 15 words.

      User language: ${user.settings.locale ?? 'en'}
        `,
    },
  ]
  const request: ChatCompletionCreateParams = {
    model,
    temperature: 0.7,
    stream: true,
    messages,
  }

  const stream = await OpenAIStream(request, async (response) => {
    await trackOpenAiUsage({
      userId: user.uuid!,
      model,
      stream: request.stream,
      feature: kFunctionName,
      messages,
      response,
    })
  })

  return createStreamedApiReponse(stream, model)
}

export default withStreamMiddleware(handler)
