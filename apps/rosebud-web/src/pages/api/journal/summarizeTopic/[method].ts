// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import withStreamMiddleware, {
  NextAuthRequest,
} from 'middleware/withStreamMiddleware'
import { handleOpenAiRequest, OpenAiRequestMethod } from 'net/openai/request'
import {
  ChatCompletionCreateParams,
  ChatCompletionMessageParam,
} from 'openai/resources'
import { Entry } from 'types/Entry'
import { formatQuestionForVectorDatabase } from 'util/entries'
import { getApiUrl } from 'util/env'
import { getGPTModelForStream } from 'util/models-server-edge'

export const config = {
  runtime: 'edge',
}

const kFunctionName = 'summarizeTopic'

type Request = {
  topic: string
  type: 'description' | 'milestones' | 'ask'
}

const handler = async (req: NextAuthRequest): Promise<Response> => {
  const user = req._user!

  const method = (req.nextUrl.searchParams.get('method') ??
    'http') as OpenAiRequestMethod

  const json = (await req.json()) as Request
  const { topic, type } = json

  let memories: Entry[] = []
  if (user.id && user.uuid && topic) {
    const currentURL = getApiUrl(req.headers)

    try {
      const body = JSON.stringify({ query: topic, topK: 20 })

      const response = await fetch(currentURL + '/api/pinecone/fetchMemories', {
        headers: {
          Cookie: req.headers.get('Cookie') || '',
        },
        method: 'POST',
        body,
      })

      memories = (await response.json()).response.memories as Entry[]
    } catch (error) {
      console.error('Error fetching memories', error)
    }
  }

  /**
   * Add context from previous conversations if available
   */

  const descriptionPrompt = `Your goal is to write a brief introduction of the user's relationship with ${topic} based on the user's previous journal entries. Only include details that directly mention ${topic}. This will be for their own private personal Wikipedia-like page about their life. Keep this description to 1-2 sentences. Avoid referring to the word "relationship" directly. Avoid acknowledging or mentioning "journaling" or "journal entries" in your description. Do not provide advice or suggestions. Do not ask questions. This should be written from their own perspective and words saying "I". Do not write more than two sentences.`

  const milestonePrompt = `Your job is to summarize a user's significant milestones related to ${topic}. Each milestone should be a single sentence preceded by the date of the milestone. DO NOT include more than one milestone per date. Each date should only appear once. Each milestone must have directly mentioned "${topic}". If a milestone is not about "${topic}", omit it. Add an emoji that represents the content of the milestone, do not use a calendar emoji. The milestones should be in chronological order. Do not provide advice or suggestions. Do not ask questions. This should be written from their own perspective and words saying "I".

  Again, do not include more than one milestone per date. Each date should only appear once. Make sure the date format is "YYYY-MM-DD".

  Limit your response to 10 milestones.
  
  Respond with the date and milestone in the following format:

  [
    {
      "emoji", "EMOJI",
      "date": "2021-01-01",
      "milestone": "MILESTONE_TEXT"
    },
    // Remaining milestones
  ]

  Do not wrap your response in markdown.

  `

  const askPrompt = `
  The user has been engaging with their AI-powered journal, Rosebud, which contains a wealth of information about the user's life, habits, and preferences. The user is currently viewing the topic page titled "${topic}".
  
  Craft a set of interactive questions that the user can ask Rosebud. These questions should be designed to prompt Rosebud to provide personalized insights, suggestions, or advice related to the topic at hand. Ensure that the questions are open-ended, thought-provoking, and formulated from the user's perspective using "I".
  
  Limit the questions to under 10 words each, tailored to encourage reflection and actionable advice for any aspect related to the topic.
  
  Return a JSON array of strings containing up to five questions suitable for any topic that the user may explore.
  
  Do not wrap your response in markdown.
  `

  const systemPromptComponents = (() => {
    switch (type) {
      case 'description':
        return [descriptionPrompt]
      case 'milestones':
        return [milestonePrompt]
      case 'ask':
        return [askPrompt]
    }
  })()

  if (memories?.length) {
    const context = memories
      .map((memory) => memory.questions[0])
      .flatMap((memory) => formatQuestionForVectorDatabase(memory))
      .join('\n')

    const memoryPrompt = `The following are previous entries you've had with the user:\n"""\n${context}\n"""\nReference these conversations when appropriate/relevant.`

    systemPromptComponents.push(memoryPrompt)
  }

  /**
   * Build the messages array
   */
  const messages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: systemPromptComponents.join('\n'),
    },
  ]

  /**
   * Determine the model to use
   */
  const model = getGPTModelForStream(kFunctionName, user)

  const request: ChatCompletionCreateParams = {
    model,
    temperature: 0,
    stream: method === 'stream',
    messages,
  }

  // if (type === 'milestones') {
  //   request.response_format = { type: 'json_object' }
  // }

  return await handleOpenAiRequest(user, method, kFunctionName, request)
}

export default withStreamMiddleware(handler)
