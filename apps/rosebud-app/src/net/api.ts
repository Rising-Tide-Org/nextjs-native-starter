import { IncomingMessage } from 'http'
import isoFetch from 'isomorphic-unfetch'
import { ApiResponse } from 'types/Api'
import fetchBuilder from 'fetch-retry'
import { kPublicUrl } from 'util/env'
import { detectRefusalText } from 'util/openai'
import { ApiError } from 'next/dist/server/api-utils'

const fetch = fetchBuilder(isoFetch)

const kStreamTimeout = 7000
const kRetryDelay = 1000
const kMaxRetries = 2

function getNextApiUrl(path: string, req?: IncomingMessage) {
  if (typeof window === 'undefined') {
    // If the request object exists, use it.
    if (req) {
      const host = req.headers.host
      if (host?.startsWith('localhost')) {
        return `http://localhost:3000${path}`
      }
      return `https://${host}${path}`
    }

    // If the request object doesn't exist, use the `kPublicUrl` directly.
    return `${kPublicUrl}${path}`
  }

  // this is running client-side, so a relative path is fine as long as this is the web not native app
  // return Capacitor.isNativePlatform() ? `http://localhost:3000${path}` : path

  // TEMP
  return `http://192.168.0.146:3000${path}`
  // TEMP
}

/**
 * Make a request to a Next.js API route. See /pages/api/
 * @param options { method, body, etc. }
 * @param req If this api request is originating from the server side
 */
export async function fetchNextApi<T>(
  path: string,
  options: RequestInit = {},
  req?: IncomingMessage,
): Promise<ApiResponse<T>> {
  console.log('==============================')
  console.log('fetchNextApi', path, options)
  console.log('==============================')

  const url = getNextApiUrl(path, req)

  console.log('==============================')
  console.log('cookies!', document.cookie)
  console.log('==============================')

  options.credentials = 'include'

  const resp = await fetch(url, {
    ...options,
    retries: kMaxRetries,
    retryDelay: kRetryDelay,
    retryOn: (
      attempt: number,
      error: Error | null,
      response: Response | null,
    ) => {
      console.log('==============================')
      console.log('retryon')
      console.log('==============================')

      // Conditional for retrying for every request, the most impactful one here is !response.ok
      if (
        (Boolean(error) || !response || !response.ok) &&
        attempt < kMaxRetries
      ) {
        console.error(
          `Retrying, attempt number ${
            attempt + 1
          } (${url}) error: ${error}, resp: ${response}`,
        )
        return true
      }
      return false
    },
  })

  console.log('==============================')
  console.log('actual resp', resp)
  console.log(path)
  console.log('==============================')

  return resp.json()
}

/**
 * Request streaming data from Next.js edge function. For use with OpenAI stream responses.
 * See /pages/api/
 * @param options { method, body, etc. }
 * @returns { start, cancel }
 * start() returns a promise that resolves when the stream is complete
 * cancel() cancels the stream
 */
export type StreamReturnType = {
  start: () => Promise<void>
  cancel: () => void
}

export type StreamRequestType = {
  path: string
  options: RequestInit & { timeout?: number }
  onData: (data: string) => void
  onComplete?: (data: string) => void
  returnEntireBuffer?: boolean
}

export function fetchNextStream(params: StreamRequestType): StreamReturnType {
  const {
    path,
    options,
    onData,
    onComplete,
    returnEntireBuffer = true,
  } = params
  const controller = new AbortController()
  const signal = controller.signal
  let timeoutId: NodeJS.Timeout

  const url = getNextApiUrl(path)

  let buffer = ''
  let caughtRefusal = false

  const start = (retryCount = 0, counterRefusal = false): Promise<void> => {
    options.credentials = 'include'

    if (counterRefusal) {
      options.headers = {
        ...options.headers,
        'counter-refusal': 'true',
      }
    }

    return new Promise<void>((resolve, reject) => {
      Promise.race([
        fetch(url, {
          ...options,
          signal,
        }),
        new Promise(
          (_, reject) =>
            (timeoutId = setTimeout(() => {
              controller.abort()
              reject(
                new Error(`Stream timed out after (retries: ${kMaxRetries})`),
              )
            }, options.timeout ?? kStreamTimeout)),
        ),
      ])
        .then(raceResult => {
          if (raceResult instanceof Error) {
            throw raceResult
          }

          clearTimeout(timeoutId)

          const response = raceResult as Response

          console.log('==============================')
          console.log('stream resp', response)
          console.log('==============================')

          if (!response.ok) {
            throw new ApiError(
              response.status,
              `API returned an error: ${response.statusText}`,
            )
          }

          if (!response.body) {
            throw new ApiError(response.status, 'No response body')
          }

          const reader = response.body.getReader()
          const decoder = new TextDecoder()
          let done = false

          const readNextChunk = async () => {
            const { value, done: doneReading } = await reader.read()
            done = doneReading
            const chunkValue = decoder.decode(value)

            if (returnEntireBuffer) {
              buffer += chunkValue
              onData(buffer)
            } else {
              onData(chunkValue)
            }

            // TODO: This is a workaround for when GPT-4 refuses to help
            // We retry the stream with a flag to the API to counter the refusal
            // We don't want to do this more than once, so we bail out if we've already caught a refusal
            // Because we can assume that the new stream is gpt-3.5
            if (!caughtRefusal && detectRefusalText(buffer)) {
              buffer += ' — '
              caughtRefusal = true
              throw new Error('Refusal detected')
            }

            if (!done) {
              await readNextChunk()
            }
          }

          return readNextChunk()
        })
        .then(() => {
          onComplete?.(buffer)
          resolve()
        })
        .catch(reject)
    }).catch(async error => {
      const { statusCode } = error as ApiError
      if (retryCount < kMaxRetries && statusCode !== 429) {
        console.warn(
          `Stream failed, retrying... (${retryCount + 1}) (${url})`,
          error,
        )
        await new Promise(resolve => setTimeout(resolve, kRetryDelay))
        return start(retryCount + 1, error.message === 'Refusal detected')
      } else {
        console.error(`Failed to stream after ${kMaxRetries} attempts.`)
        throw error
      }
    })
  }

  const cancel = () => {
    clearTimeout(timeoutId)
    controller.abort()
  }

  return { start, cancel }
}
