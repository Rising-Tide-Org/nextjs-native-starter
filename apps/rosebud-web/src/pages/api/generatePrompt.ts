import { NextApiResponse } from 'next'
import { Entry } from 'types/Entry'
import { captureException } from '@sentry/nextjs'
import { getGPTModel } from 'util/models-server'
import withMiddleware from 'middleware'
import { NextAuthApiRequest } from 'middleware/tokenVerification'
import { trackOpenAiUsage } from 'lib/edge/mixpanel'
import {
  ChatCompletionCreateParams,
  ChatCompletionMessageParam,
} from 'openai/resources'
import OpenAI from 'openai'

const kFunctionName = 'generatePersonalPrompts'

export type PromptResponse = {
  question: string
  type: 'personal' | 'notification'
}

const handler = async (req: NextAuthApiRequest, res: NextApiResponse) => {
  const user = req._user!
  const entry = JSON.parse(req.body)?.entry as Entry
  const locale = user.settings.locale ?? 'en'

  try {
    const openaiApi = new OpenAI()
    const model = getGPTModel(kFunctionName, req._user!)
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: generateSystemPrompt(locale),
      },
      {
        role: 'user',
        content: generateUserPrompt(entry),
      },
    ]
    const request: ChatCompletionCreateParams = {
      model,
      temperature: 0.3,
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

    let jsonResponse: PromptResponse[] = []
    // Sometimes the AI returns a string instead of JSON so instead of failing we send back the defaults
    try {
      jsonResponse = JSON.parse(response)
    } catch (error) {
      console.error(error)

      res
        .status(500)
        .json({ error: 'AI could not process the entries. Please try again' })
      return null
    }

    // Set the model this endpoint is ran with in the response header
    res.setHeader('X-Model-Used', model)
    res.setHeader('Content-Type', 'text/plain')

    res.status(200).json({
      response: jsonResponse,
    })
  } catch (error) {
    console.error(error)
    captureException(error)
    res.status(500).json({ error: { message: error.message } })
  }
}

function generateSystemPrompt(locale: string): string {
  return `You are a helpful and insightful coach and therapist. You ask great questions. Respond in this language: ${locale}

Develop 3 "follow-up" questions that are open-ended and help the user explore a topic, emotion, relationship, or activity further. Use this format:
- type: "personal"
- question: {question}

Develop 3 "notification" questions to check in with the user after 24 hours. Do this by picking topics, emotions, or people from the journal entry and then asking specific questions based on that like a coach or friend checking in with the user. Use this format:
- type: "notification"
- question: {question}

Instructions:
- If the user has provided the name of the person, event, activity or place be specific and mention it in the question.
- The prompt will be shown to the user later out of context, so don't use "it" or "that" or "this"
- Keep questions under 10 words
- Use "You" and not "I"
- Don't mention "today" or "tomorrow"
- One question per prompt only

Return these questions in a JSON format as an array.`
}

function generateUserPrompt(entry: Entry): string {
  return `
  Here is my journal entry:
  ${formatEntry(entry)}
  `
}

/**
 * Formats an entry into a string that can be used to inform the prompts
 */
function formatEntry(entry: Entry): string {
  return entry.questions
    .map(
      (question) => `
Q: ${question.prompt?.content?.slice(-1).join('\n')}
A: ${question.response?.join('\n')}
`
    )
    .join('')
}

export default withMiddleware({
  methods: ['POST'],
  authenticated: true,
})(handler)
