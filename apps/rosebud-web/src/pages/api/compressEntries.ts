// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiResponse } from 'next'
import { Entry } from 'types/Entry'
import { captureException } from '@sentry/nextjs'
import {
  ChatCompletionCreateParams,
  ChatCompletionMessageParam,
} from 'openai/resources'
import withMiddleware from 'middleware'
import { NextAuthApiRequest } from 'middleware/tokenVerification'
import { GPTModel } from 'constants/models'
import moment from 'moment'
import { kMaxContextWindowCharacters } from 'constants/limits'
import { getGPTModel } from 'util/models-server'
import { trackOpenAiUsage } from 'lib/edge/mixpanel'
import OpenAI from 'openai'

const kFunctionName = 'compressEntries'

// https://vercel.com/changelog/serverless-functions-can-now-run-up-to-5-minutes
export const maxDuration = 300

const handler = async (req: NextAuthApiRequest, res: NextApiResponse) => {
  const user = req._user!
  const entries = JSON.parse(req.body)?.entries as Entry[]

  try {
    const openaiApi = new OpenAI()
    const model: GPTModel = getGPTModel(kFunctionName, req._user!)
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'user',
        content: `Below are my journal entries:

        ${formatEntries(entries, model)}

        Please summarize my answers for each day, written in first person in my voice, as if it was a journal entry recounting my week. Don't leave anything out. Do not write "Overall", or talk about "ups and downs". Only use my words and don't infer further.
        `,
      },
    ]
    const request: ChatCompletionCreateParams = {
      model,
      temperature: 0,
      max_tokens: 1024,
      messages,
    }

    const completion = await openaiApi.chat.completions.create(request)
    const response = completion.choices[0].message.content

    if (!response) {
      res.status(500).json({ error: 'No response from AI' })
      return null
    }

    await trackOpenAiUsage({
      userId: user.uuid!,
      model,
      stream: request.stream,
      feature: kFunctionName,
      messages,
      response,
    })

    res.status(200).json(response)
  } catch (error) {
    console.error(error)
    captureException(error)
    res.status(500).json({ error: { message: error.message } })
  }
}

function formatEntries(entries: Entry[], model: GPTModel): string {
  const result = [...entries]
    .sort((a, b) => ((a.date ?? 0) > (b.date ?? 0) ? 1 : -1))
    .map(
      (entry) => `\n\n${moment(entry.date).format('MMMM Do, YYYY')}
      ${entry.questions
        .filter((question) => question.response[0]?.length > 0)
        .map(
          (question) => `
  
  Q: ${question.prompt.content.slice(-1).join('\n')}
  A: ${question.response.join('\n')}
  `
        )
        .join('')}`
    )
    .join('')
  return result.length > kMaxContextWindowCharacters[model]
    ? result.substring(0, kMaxContextWindowCharacters[model])
    : result
}

export default withMiddleware({
  methods: ['POST'],
  authenticated: true,
})(handler)
