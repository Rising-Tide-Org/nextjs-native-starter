// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { trackOpenAiUsage } from 'lib/edge/mixpanel'
import { Entry } from 'types/Entry'
import withStreamMiddleware, {
  NextAuthRequest,
} from 'middleware/withStreamMiddleware'
import { OpenAIStream } from 'net/openai/stream'
import { NextResponse } from 'next/server'
import {
  ChatCompletionCreateParams,
  ChatCompletionMessageParam,
} from 'openai/resources'
import { User } from 'types/User'
import { formatEntriesForChatCompletion } from 'util/entries'
import { getGPTModelForStream } from 'util/models-server-edge'
import { createStreamedApiReponse } from 'util/openai'
import { kDefaultSuggestionsPrompt } from 'templates'

export const config = {
  runtime: 'edge',
}

const kFunctionName = 'suggestCommitments'

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

  let systemPrompt = kDefaultSuggestionsPrompt(user)
  try {
    const templateIds = new Set(entries.map((e) => e.templateId))
    if (templateIds.size === 1) {
      const templateId = templateIds.values().next().value
      // Dynamically import the template's system prompt, if it exists
      const suggestionsPromptFunc = (
        await import(`templates/${templateId}/suggestions`)
      )?.default as (user: User) => string
      if (suggestionsPromptFunc) systemPrompt = suggestionsPromptFunc(user)
    }
  } catch (error) {
    console.error(error)
  }

  const model = getGPTModelForStream(kFunctionName, req._user)
  const messages: ChatCompletionMessageParam[] = [
    ...formatEntriesForChatCompletion(entries),
    {
      role: 'system',
      content: systemPrompt,
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
