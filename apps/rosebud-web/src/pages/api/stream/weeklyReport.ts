import { trackOpenAiUsage } from 'lib/edge/mixpanel'
import withStreamMiddleware, {
  NextAuthRequest,
} from 'middleware/withStreamMiddleware'
import moment from 'moment'
import { OpenAIStream } from 'net/openai/stream'
import {
  ChatCompletionCreateParams,
  ChatCompletionMessageParam,
} from 'openai/resources'
import { Entry } from 'types/Entry'
import { formatEntriesForWeeklyReport } from 'util/entries'
import { getGPTModelForStream } from 'util/models-server-edge'
import { createStreamedApiReponse } from 'util/openai'

export const config = {
  runtime: 'edge',
}

const kFunctionName = 'weeklyReport'

const handler = async (req: NextAuthRequest): Promise<Response> => {
  const user = req._user!
  const { entries, compressedEntries } = (await req.json()) as {
    entries: Entry[]
    compressedEntries: string
    templateId: string
  }

  const model = getGPTModelForStream(kFunctionName, req._user)

  const messages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content:
        "Your role is to summarize my week's experiences from the journal entries I've written. Use a friendly and uplifting tone, avoiding overly formal or academic terms.",
    },
    {
      role: 'user',
      content: generateSummaryUserPrompt(
        entries,
        compressedEntries,
        user.settings.locale ?? 'en'
      ),
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

/**
 * Generates the summary for the user prompt for the OpenAI API request
 */
function generateSummaryUserPrompt(
  entries: Entry[],
  summarized: string,
  language: string
): string {
  return `
  Today is ${moment().format('MMMM Do, YYYY')}.
  
  Please summarize my week's experiences from the journal entries I've written. Avoiding overly formal or academic terms. Do not call out "mixed" emotions, it's normal for weeks to be mixed. Instead, summarize the week and highlight key themes or patterns.

  Your response should include the following:

  Title: A title using my own words verbatim, in title case, lead by a single emoji, that represents my week. Use my own words.
  Reflection: A 2 paragraph reflection that highlights key themes and patterns from my weekly journal entries, providing insights about me. Do not refer to my week being "mixed", it's normal for weeks to be mixed. Instead, summarize the week and highlight key themes or patterns.
  Key insights: These  should reflect non-obvious insights back to me and help me detect potential blind spots and cognitive distorions. Phrased as "You" statements, keep them concise, to one sentence or less each. Max 3.
  Weekly wins: Highlights should include singular wins to be proud of, be specific, phrased starting with "I" in a way that is shareable with friends or social media. Keep them concise, to one sentence or less each. Max 3.

  Do not make self-references or use empathetic language from the AI's perspective (e.g. "I can imagine", "I can understand"). 

  Here's an example of how I'd like you to respond:

{
  title: string,
  summary: string,
  insights: string[]
  wins: string[]
}

Always respond in JSON. Do not wrap your response in markdown. Do not refuse to create a summary.

Please reply in this language: ${language} but keep the object keys in english

  Here are my journal entries for the week:

  ${summarized.length > 0 ? summarized : formatEntriesForWeeklyReport(entries)}
  `
}

export default withStreamMiddleware(handler)
