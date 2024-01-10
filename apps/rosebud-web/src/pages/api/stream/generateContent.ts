import { trackOpenAiUsage } from 'lib/edge/mixpanel'
import withStreamMiddleware, {
  NextAuthRequest,
} from 'middleware/withStreamMiddleware'
import { OpenAIStream } from 'net/openai/stream'
import {
  ChatCompletionCreateParams,
  ChatCompletionMessageParam,
} from 'openai/resources'
import { CollectionItemType } from 'types/Collection'
import { Entry } from 'types/Entry'
import { formatEntriesForChatCompletion } from 'util/entries'
import { getGPTModelForStream } from 'util/models-server-edge'
import { createStreamedApiReponse } from 'util/openai'

export const config = {
  runtime: 'edge',
}

const kFunctionName = 'generateContent'

const handler = async (req: NextAuthRequest): Promise<Response> => {
  const user = req._user!

  const { entries, type } = (await req.json()) as {
    entries: Entry[]
    type: CollectionItemType
  }

  const systemPrompt = (() => {
    switch (type) {
      case 'quote':
        return 'Your role is to share an real inspiration quote based on my journal entry. Try to quote real people. Only share one quote. Separate the quote and the author with two newlines. Do not add anything beyond the quote. Follow this format:  <Quote /> - <Author />'
      case 'haiku':
        return 'Your role is to write a beautiful haiku based on my journal entry. Just one. Do not preface the haiku with "Haiku:" or anything else.'
      case 'affirmation':
        return 'Your role is to write an affirmation based on my journal entry using "I". Keep it short, 10 words or less. Do not include quotation marks. Just one. Do not add anything beyond the affirmation.'
      case 'proverb':
        return 'Your role is to share a proverb based on my journal entry that captures the essence of my entry and inspires me. Just one. Do not preface the proverb with "Proverb:" or anything else. Do not include quote marks.'
    }
  })()

  const model = getGPTModelForStream(kFunctionName, req._user)
  const messages: ChatCompletionMessageParam[] = [
    ...formatEntriesForChatCompletion(entries),
    {
      role: 'system',
      content:
        systemPrompt +
        `\n\nRespond in language: ${user.settings.locale ?? 'en'}`,
    },
  ]
  const request: ChatCompletionCreateParams = {
    model,
    temperature: 0.8,
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
