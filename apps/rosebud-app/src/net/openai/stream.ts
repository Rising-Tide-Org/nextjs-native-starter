import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from 'eventsource-parser'
import { ChatCompletionCreateParams } from 'openai/resources'

// Code sourced from
// https://levelup.gitconnected.com/how-to-stream-real-time-openai-api-responses-next-js-13-2-gpt-3-5-turbo-and-edge-functions-378fea4dadbd

export async function OpenAIStream(
  request: ChatCompletionCreateParams,
  onComplete?: (response: string) => Promise<void>
) {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ''}`,
    },
    method: 'POST',
    body: JSON.stringify(request),
  })

  let buffer = ''

  const stream = new ReadableStream({
    async start(controller) {
      // callback
      async function onParse(event: ParsedEvent | ReconnectInterval) {
        if (event.type === 'event') {
          const data = event.data
          // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
          if (data === '[DONE]') {
            await onComplete?.(buffer)
            controller.close()
            return
          }
          try {
            const json = JSON.parse(data)
            const text = json.choices[0].delta?.content || ''
            buffer += text
            const queue = encoder.encode(text)
            controller.enqueue(queue)
          } catch (e) {
            // maybe parse error
            controller.error(e)
          }
        }
      }

      // stream response (SSE) from OpenAI may be fragmented into multiple chunks
      // this ensures we properly read chunks and invoke an event for each SSE event stream
      const parser = createParser(onParse)
      // https://web.dev/streams/#asynchronous-iteration
      for await (const chunk of response.body as any) {
        parser.feed(decoder.decode(chunk))
      }
    },
  })

  return stream
}
