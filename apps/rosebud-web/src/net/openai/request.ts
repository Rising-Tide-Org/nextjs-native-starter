import { trackOpenAiUsage } from 'lib/edge/mixpanel'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import {
  ChatCompletionCreateParams,
  ChatCompletionCreateParamsNonStreaming,
} from 'openai/resources'
import { User } from 'types/User'
import { OpenAIStream } from './stream'

/**
 * Allows us to use the OpenAI API in a streaming or non-streaming way
 * @param user The requesting user
 * @param method The method to use for the request (streaming or non-streaming)
 * @param callingFunction The name of the function that is calling this function
 * @returns A NextResponse object
 */

export type OpenAiRequestMethod = 'stream' | 'http'

export const handleOpenAiRequest = async (
  user: User,
  method: OpenAiRequestMethod,
  callingFunction: string,
  request: ChatCompletionCreateParams | ChatCompletionCreateParamsNonStreaming
): Promise<NextResponse> => {
  const trackOpenAiUsageFunc = async (response: string) => {
    await trackOpenAiUsage({
      userId: user.uuid!,
      model: request.model,
      stream: request.stream,
      feature: callingFunction,
      messages: request.messages,
      response,
    })
  }

  if (method === 'http') {
    const openaiApi = new OpenAI()
    const completion = await openaiApi.chat.completions.create(
      request as ChatCompletionCreateParamsNonStreaming
    )
    const response = completion.choices[0].message.content

    if (!response) {
      return new NextResponse(
        JSON.stringify({ error: 'No response from AI' }),
        {
          status: 500,
        }
      )
    }

    await trackOpenAiUsageFunc(response)

    return new NextResponse(JSON.stringify({ response }), {
      status: 200,
    })
  } else {
    const stream = await OpenAIStream(request, async (response) => {
      await trackOpenAiUsageFunc(response)
    })
    const response = new NextResponse(stream)

    // Setting header to inform client of the model used to generate the response
    response.headers.append('X-Model-Used', request.model)
    response.headers.append('Content-Type', 'text/plain')

    return response
  }
}
