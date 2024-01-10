// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiResponse } from 'next'
import { Entry } from 'types/Entry'
import { captureException as sentryCaptureException } from '@sentry/nextjs'
import { getGPTModel } from 'util/models-server'
import withMiddleware from 'middleware'
import { NextAuthApiRequest } from 'middleware/tokenVerification'
import { trackOpenAiUsage } from 'lib/edge/mixpanel'
import {
  ChatCompletionCreateParams,
  ChatCompletionMessageParam,
} from 'openai/resources'
import OpenAI from 'openai'

const kFunctionName = 'extractEntities'

const handler = async (req: NextAuthApiRequest, res: NextApiResponse) => {
  const user = req._user!
  const entries = JSON.parse(req.body)?.entries as Entry[]

  if (!entries.length) {
    res.status(400).json({ error: 'No entries provided' })
    return
  }

  try {
    const openaiApi = new OpenAI()
    const model = getGPTModel(kFunctionName, user)
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content:
          'You help detect emotions, people, places, and topics in journal entries and return extracted entities in JSON format.',
      },
      {
        role: 'user',
        content: extractEntities(entries, user.settings.locale ?? 'en'),
      },
    ]
    const request: ChatCompletionCreateParams = {
      model,
      temperature: 0,
      messages,
    }
    const completion = await openaiApi.chat.completions.create(request)
    const response = completion.choices[0].message?.content

    if (!response) {
      res.status(500).json({ error: 'No response from AI' })
      return null
    }

    let jsonResponse = null

    // Sometimes the AI returns a string instead of JSON so instead of failing we send back the defaults
    try {
      jsonResponse = JSON.parse(response)
    } catch (error) {
      jsonResponse = {
        emotions: [],
        people: [],
        places: [],
        topics: [],
      }
    }

    await trackOpenAiUsage({
      userId: user.uuid!,
      model,
      stream: request.stream,
      feature: kFunctionName,
      messages,
      response,
    })

    // Set the model this endpoint is ran with in the response header
    res.setHeader('X-Model-Used', model)
    res.setHeader('Content-Type', 'text/plain')

    res.status(200).json({
      response: jsonResponse,
    })
  } catch (error) {
    console.error(error)
    sentryCaptureException(error)
    res.status(500).json({ error: { message: error.message } })
  }
}

/**
 * Generates a prompt for the OpenAI API
 */
function extractEntities(entries: Entry[], language: string): string {
  return `
  Please extract predominant emotions, specific named individuals, and main topics from the following journal entry. Choose the 5 most relevant topics, but avoid including collective nouns or first-person pronouns like "kids", "friends", "family", or "audience". 
    
  This is just an example:

  { 
    "emotions": [ {label: "Happy", emoji: "😀"}, {label: "Sad", emoji: "😔"}, {label: "Excited", emoji: "😄"}],
    "people": [{"name": "John", "relation": "Brother"}, {"name": "Alice", "relation": "Partner"}],
    "topics": ["Career Development", "Relationships", "Travel", "Health"]
  }

  If there are no matches, please return an empty array for that category. It's okay to return categories with fewer than 5 matches.

  Please reply in this language: ${language} but keep the object keys in english

  Now, kindly analyze this journal entry:

  ${entries.map(formatEntry).join('')}

  `
}

/**
 * Formats an entry into a string that can be used as a prompt
 */
function formatEntry(entry: Entry): string {
  return entry.questions
    .map(
      (question) => `
      ${question.response?.join('\n')}
  `
    )
    .join('')
}

export default withMiddleware({
  methods: ['POST'],
  authenticated: true,
})(handler)
