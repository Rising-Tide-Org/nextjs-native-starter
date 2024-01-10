import { kMaxContextWindowCharacters } from 'constants/limits'
import { GPTModel } from 'constants/models'
import { NextResponse } from 'next/server'
import { ChatCompletionMessageParam } from 'openai/resources'

export const detectRefusalText = (str: string): boolean =>
  str.includes("I'm really sorry to hear that you're feeling this way") ||
  str.includes("I'm really sorry that you're feeling this way") ||
  str.includes("I'm really sorry you're feeling this way")

/**
 * trimContextWindow trims the chat completion request messages to ensure they stay within a specified character limit.
 *
 * Here's how the trimming strategy works:
 * 1. System prompts are always retained.
 * 2. Assistant messages, starting from the oldest, are truncated one by one to their last sentence until the context length is met.
 * 3. If that doesn't do it, user messages are processed in this order:
 *    - If removing a user message would bring the total length below the character limit, the message is truncated word by word from the beginning.
 *    - If removing a user message still keeps the total length above the limit, the entire message is removed.
 *    - Paired assistant messages that immediately follow a user message are also removed.
 * 4. If we still haven't reached the character limit, system prompts are truncated word by word from the end.
 *
 * The function iterates over the list of messages until the content stays within the specified character limit or until all messages are processed. It always removes oldest first.
 *
 * @param messages - An array of chat completion request messages.
 * @param characterLimit - The maximum allowed character limit (default is set to kMaxContextWindowCharacters).
 * @returns - A new array of messages adjusted to fit within the character limit.
 */

export const trimContextWindow = (
  messages: ChatCompletionMessageParam[],
  characterLimit = kMaxContextWindowCharacters['gpt-4-0613']
): ChatCompletionMessageParam[] => {
  const totalLength = messages.reduce(
    (acc, message) => acc + (message?.content?.length ?? 0),
    0
  )

  if (totalLength <= characterLimit) {
    return messages
  }

  const trimmedMessages = [...messages]
  let currentLength = totalLength

  // Truncate assistant messages starting from the oldest
  for (
    let i = 0;
    i < trimmedMessages.length && currentLength > characterLimit;
    i++
  ) {
    if (
      !trimmedMessages[i].content ||
      typeof trimmedMessages[i].content !== 'string'
    ) {
      continue
    }
    const content = trimmedMessages[i].content as string

    if (trimmedMessages[i].role === 'assistant') {
      const lastSentence = content.split('\n').pop() ?? ''
      currentLength = currentLength - content.length + lastSentence.length
      trimmedMessages[i].content = lastSentence
    }
  }

  // Remove user messages starting from the oldest but ensure at least one user message remains
  let i = 0
  while (i < trimmedMessages.length - 1 && currentLength > characterLimit) {
    if (
      !trimmedMessages[i].content ||
      typeof trimmedMessages[i].content !== 'string'
    ) {
      continue
    }
    let content = trimmedMessages[i].content as string

    // Ensure at least one user message remains
    if (trimmedMessages[i].role === 'user') {
      const potentialLengthAfterRemoval = currentLength - content.length

      if (potentialLengthAfterRemoval < characterLimit) {
        const words = content.split(' ')

        while (words.length > 0 && currentLength > characterLimit) {
          const removedWord = words.shift()
          currentLength -= removedWord ? removedWord.length + 1 : 0
        }

        content = words.join(' ')
      } else {
        if (
          i < trimmedMessages.length - 1 &&
          trimmedMessages[i + 1].role === 'assistant'
        ) {
          currentLength -= trimmedMessages[i + 1].content!.length
          trimmedMessages.splice(i + 1, 1) // Remove the paired assistant message
        }

        currentLength -= content.length
        trimmedMessages.splice(i, 1) // Remove the user message
      }
    } else {
      i++
    }
  }

  // Truncate system prompts word by word if needed, starting from the last system prompt
  if (
    currentLength > characterLimit &&
    trimmedMessages.filter((msg) => msg.role === 'user').length === 1
  ) {
    for (
      let i = trimmedMessages.length - 1;
      i >= 0 && currentLength > characterLimit;
      i--
    ) {
      if (
        !trimmedMessages[i].content ||
        typeof trimmedMessages[i].content !== 'string'
      ) {
        continue
      }
      let content = trimmedMessages[i].content as string

      if (trimmedMessages[i].role === 'system') {
        const words = content.split(' ')

        while (words.length > 0 && currentLength > characterLimit) {
          const removedWord = words.pop()
          currentLength -= removedWord ? removedWord.length + 1 : 0 // +1 for space separator
        }

        // Update the system prompt's content
        content = words.join(' ')

        // If the system prompt's content is now empty, remove it from the array
        if (!content) {
          trimmedMessages.splice(i, 1)
        }
      }
    }
  }

  return trimmedMessages
}

export const createStreamedApiReponse = (
  stream: ReadableStream<any>,
  model: GPTModel
) => {
  const response = new NextResponse(stream)

  // Setting header to inform client of the model used to generate the response
  response.headers.append('X-Model-Used', model)

  // setting content-type fixes streaming responses hanging in Firefox
  response.headers.append('Content-Type', 'text/plain')

  return response
}
