import { isDev } from 'util/env'
import { encode } from 'gpt-tokenizer'
import { ChatCompletionMessageParam } from 'openai/resources'

/**
 * Helper to track usage of OpenAI API
 */
export const trackOpenAiUsage = async (
  request: {
    userId: string
    model: string
    stream?: boolean | null
    feature: string
    messages: ChatCompletionMessageParam[]
    response: string
  },
  eventProps: Record<string, any> = {}
): Promise<{ success: boolean; error?: string }> => {
  const systemPromptTokens = request.messages
    .filter((m) => m.role === 'system')
    .reduce(
      (total, message) => total + encode(message.content as string).length,
      0
    )

  const requestTokens = request.messages.reduce(
    (total, message) => total + encode(message.content as string).length,
    0
  )
  const responseTokens = encode(request.response).length

  return trackEvent(request.userId, 'llm.request', {
    provider: 'openai',
    model: request.model,
    stream: Boolean(request.stream),
    feature: request.feature,
    systemPromptTokens,
    chatHistoryTokens: requestTokens - systemPromptTokens,
    requestTokens,
    responseTokens,
    totalTokens: requestTokens + responseTokens,
    ...eventProps,
  })
}

/**
 * Track a mixpanel event, for use in edge routes
 * @param userId user uuid
 * @param eventName
 * @param eventProps
 * @returns
 */

export const trackEvent = async (
  userId: string,
  eventName: string,
  eventProps: Record<string, any> = {}
): Promise<{ success: boolean; error?: string }> => {
  const mixpanelToken = process.env.MIXPANEL_TOKEN

  if (isDev()) {
    console.info('[Analytics]', eventName, userId, eventProps)
  }

  try {
    const base64Event = Buffer.from(
      JSON.stringify({
        event: eventName,
        properties: {
          ...eventProps,
          distinct_id: userId,
          token: mixpanelToken,
        },
      })
    ).toString('base64')

    const data = `data=${base64Event}`

    const response = await fetch('http://api.mixpanel.com/track/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: data,
    })

    const responseBody = await response.text()

    if (responseBody === '1') {
      return {
        success: true,
      }
    } else {
      return {
        success: false,
        error: 'Failed to send event to Mixpanel',
      }
    }
  } catch (error) {
    return {
      success: false,
      error: 'An error occurred: ' + error.message,
    }
  }
}
