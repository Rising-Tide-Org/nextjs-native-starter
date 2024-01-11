import { fetchNextApi, fetchNextStream, StreamReturnType } from 'net/api'
import { ChatCompletionMessageParam } from 'openai/resources'
import { CollectionItemType } from 'types/Collection'
import { ComposeResponse } from 'types/Compose'
import { Entry } from 'types/Entry'

/**
 * Generate personalized prompts based on the entry
 * @param entry
 * @returns
 */
export const generatePrompt = (entry: Entry) =>
  fetchNextApi<string[]>('/api/generatePrompt', {
    method: 'POST',
    body: JSON.stringify({ entry }),
  })

/**
 * Generate personalized prompts based on a topic
 * @param entry
 * @returns
 */
export const generateTopicPrompts = (topic: string) =>
  fetchNextApi<string[]>('/api/generateTopicPrompts', {
    method: 'POST',
    body: JSON.stringify({ topic }),
  })

/**
 * Generate multiple prompts for the user to fill out
 * @param entries
 * @param type
 * @returns
 */
export const generatePromptsStream = (
  entries: Entry[],
  onData: (data: string) => void,
) =>
  fetchNextStream({
    path: '/api/stream/generatePrompts',
    options: {
      method: 'POST',
      body: JSON.stringify({ entries }),
    },
    onData,
  })

/**
 * Generate a follow-up answers
 * @param entries
 * @param type
 * @returns
 */
export const digDeeperStream = (
  {
    entries,
    memories,
    templateId,
    localDate,
  }: {
    entries: Entry[]
    memories?: ComposeResponse[]
    templateId: string
    localDate: string
  },
  onData: (data: string) => void,
  onComplete?: (data: string) => void,
) =>
  fetchNextStream({
    path: '/api/stream/digDeeper',
    options: {
      method: 'POST',
      body: JSON.stringify({ entries, memories, templateId, localDate }),
    },
    onData,
    onComplete,
  })

/**
 * Generate a prompt for the user to fill out
 * @param entries
 * @param type
 * @returns
 */
export const suggestCommitmentsStream = (
  entries: Entry[],
  onData: (data: string) => void,
  onComplete?: () => void,
): StreamReturnType =>
  fetchNextStream({
    path: '/api/stream/suggestCommitments',
    options: {
      method: 'POST',
      body: JSON.stringify({ entries }),
    },
    onData,
    onComplete,
  })

/**
 * Extract entities from the user's entries (emotions, people, etc.)
 * @param entries
 * @returns
 */
export const extractEntities = (entries: Entry[]) =>
  fetchNextApi('/api/extractEntities', {
    method: 'POST',
    body: JSON.stringify({ entries }),
  })

/**
 * Generate a weekly report from the user's entries
 * @param entries
 * @param compressedEntries If number of entries are greater than the model allows, pass the result of /api/compressEntries. Else pass an empty string.
 * @returns
 */
export const weeklyReportStream = (
  entries: Entry[],
  compressedEntries: string,
  onData: (data: string) => void,
  onComplete?: (data: string) => void,
): StreamReturnType =>
  fetchNextStream({
    path: '/api/stream/weeklyReport',
    options: {
      method: 'POST',
      body: JSON.stringify({
        entries,
        compressedEntries,
      }),
      timeout: 60000,
    },
    onData,
    onComplete,
  })

/**
 * Compresses some number of entries into a briefer summary. Useful to avoid openAI token limits.
 */
export const compressEntries = async (entries: Entry[]) =>
  fetchNextApi<string>('/api/compressEntries', {
    method: 'POST',
    body: JSON.stringify({ entries }),
  })

/**
 * Pass messages through to the OpenAI API directly
 * @param entries
 * @returns
 */
export const passThru = (messages: ChatCompletionMessageParam[]) =>
  fetchNextApi<string>('/api/passThru', {
    method: 'POST',
    body: JSON.stringify({ messages }),
  })

export const passThruStream = (
  messages: ChatCompletionMessageParam[],
  onData: (data: string) => void,
) =>
  fetchNextStream({
    path: '/api/stream/passThru',
    options: {
      method: 'POST',
      body: JSON.stringify({ messages }),
    },
    onData,
  })

/**
 * Generate a post-entry reflection
 * @returns stream
 */
export const entryReflection = (
  {
    entries,
    templateId,
  }: {
    entries: Entry[]
    templateId: string
  },
  onData: (data: string) => void,
  onComplete?: () => void,
) =>
  fetchNextStream({
    path: '/api/stream/entryReflection',
    options: {
      method: 'POST',
      body: JSON.stringify({ entries, templateId }),
    },
    onData,
    onComplete,
    returnEntireBuffer: false,
  })

/**
 * Generate a prompt for the user to fill out
 * @param entries
 * @param type
 * @returns
 */
export const generateContent = (
  entries: Entry[],
  type: CollectionItemType,
  onData: (data: string) => void,
  onComplete?: () => void,
): StreamReturnType =>
  fetchNextStream({
    path: '/api/stream/generateContent',
    options: {
      method: 'POST',
      body: JSON.stringify({ entries, type }),
    },
    onData,
    onComplete,
  })

/**
 * Transcribe audio
 * @param file
 * @param language
 * @returns
 */
export const transcribeAudio = (file: string, language: string) =>
  fetchNextApi<string>('/api/whisper', {
    method: 'POST',
    body: JSON.stringify({ file, language }),
  })

/**
 * Generate a summary of a topic for a user
 * @param entries
 * @param type
 * @returns
 */

export const summarizeTopic = <T>(
  topic: string,
  type: 'description' | 'milestones' | 'ask',
) =>
  fetchNextApi<T>('/api/journal/summarizeTopic/http', {
    method: 'POST',
    body: JSON.stringify({ topic, type }),
  })

export const summarizeTopicStream = (
  topic: string,
  type: 'description' | 'milestones',
  onData: (data: string) => void,
  onComplete?: (data: string) => void,
): StreamReturnType =>
  fetchNextStream({
    path: '/api/journal/summarizeTopic/stream',
    options: {
      method: 'POST',
      body: JSON.stringify({ topic, type }),
    },
    onData,
    onComplete,
  })
