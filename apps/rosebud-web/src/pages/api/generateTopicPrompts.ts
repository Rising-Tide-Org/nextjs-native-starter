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
import { formatQuestionForVectorDatabase } from 'util/entries'
import { isDev } from 'util/env'
import moment from 'moment'

const kFunctionName = 'generateTopicPrompts'

const handler = async (req: NextAuthApiRequest, res: NextApiResponse) => {
  const user = req._user!
  const body = JSON.parse(req.body)
  const topic = body.topic as string
  const locale = user.settings.locale ?? 'en'

  try {
    const currentURL = `${isDev() ? 'http' : 'https'}://${req.headers.host}`

    const result = await fetch(currentURL + '/api/pinecone/fetchMemories', {
      headers: {
        Cookie: req.headers.cookie || '',
      },
      method: 'POST',
      body: JSON.stringify({ query: topic, topK: 10 }),
    })

    const memories = (await result.json()).response.memories as Entry[]

    const openaiApi = new OpenAI()
    const model = getGPTModel(kFunctionName, req._user!)
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: generateSystemPrompt(locale, topic, memories),
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

    let jsonResponse = []
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

    res.status(200).json({
      response: jsonResponse,
    })
  } catch (error) {
    console.error(error)
    captureException(error)
    res.status(500).json({ error: { message: error.message } })
  }
}

function generateSystemPrompt(
  locale: string,
  topic: string,
  entries: Entry[]
): string {
  const context = entries
    .map((e) => e.questions)
    .map((memory) => formatQuestionForVectorDatabase(memory[0]))
    .join('\n')

  return `You are a therapist with 20 years of experience. You are helping a patient with the following topic: ${topic}

  Take a moment to reflect on the patient's situation based on their topic.

  Today is ${moment().format('dddd, MMMM Do YYYY')}
  
  Here are some previous questions you have asked other patients about this topic, along with their responses:
  
  ${context}
  
  Please formulate your questions based on the above context, specifically referencing aspects of the user's previous answers related to ${topic}. Be mindful of the date of the previous answers compared to today's date. Do not say "since we last spoke", instead mention the broad time period. The user may not remember what entry you are referring to, so be specific. Don't say "during the trip", instead say "during your trip to Paris".
  
  Ask open-ended questions that encourage deeper self-reflection. Try to keep your questions concise, preferably under 10 words. Avoid questions that can be answered with a simple yes or no.
  
  Respond in the language specified: ${locale}
  
  Format your response as a JSON array of strings, with a limit of 5 questions, under 10 words each.
  `
}

export default withMiddleware({
  methods: ['POST'],
  authenticated: true,
})(handler)
