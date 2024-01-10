import { trackOpenAiUsage } from 'lib/edge/mixpanel'
import withStreamMiddleware, {
  NextAuthRequest,
} from 'middleware/withStreamMiddleware'
import { OpenAIStream } from 'net/openai/stream'
import {
  ChatCompletionCreateParams,
  ChatCompletionMessageParam,
} from 'openai/resources'
import {
  kDefaultSummarySystemPrompt,
  kDefaultSummaryUserPrompt,
} from 'templates'
import { Entry } from 'types/Entry'
import { formatEntriesForChatCompletion } from 'util/entries'
import { getGPTModelForStream } from 'util/models-server-edge'
import { createStreamedApiReponse } from 'util/openai'

export const config = {
  runtime: 'edge',
}

const kFunctionName = 'entryReflection'

const handler = async (req: NextAuthRequest): Promise<Response> => {
  const user = req._user!
  const { entries, templateId } = (await req.json()) as {
    entries: Entry[]
    templateId: string
  }

  let userPrompt = kDefaultSummaryUserPrompt
  try {
    userPrompt = (await import(`templates/${templateId}/summary`)).default
  } catch (error) {
    // No-op.
  }

  const model = getGPTModelForStream(kFunctionName, req._user)
  const messages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: kDefaultSummarySystemPrompt,
    },
    ...formatEntriesForChatCompletion(entries),
    {
      role: 'user',
      content: userPrompt + `\nUser language: ${user.settings.locale ?? 'en'}`,
    },
  ]
  const request: ChatCompletionCreateParams = {
    model,
    temperature: 0.5,
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
