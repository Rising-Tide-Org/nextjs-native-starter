import { fetchNextApi } from 'net/api'
import { ComposeResponse } from 'types/Compose'
import { Entry } from 'types/Entry'
import { TimestampRange } from 'types/EntryVector'

export const indexEntriesPinecone = (entries: Entry[]) =>
  fetchNextApi<{}>('/api/pinecone/indexEntries', {
    method: 'POST',
    body: JSON.stringify({ entries }),
  })

export const backfillVectorsPinecone = () =>
  fetchNextApi<void>('/api/pinecone/backfillVectors', {
    method: 'POST',
  })

export const fetchMemories = async (options: {
  responses?: ComposeResponse[]
  topK?: number
  memoryRange?: TimestampRange
  query?: string
}): Promise<Entry[]> => {
  const resp = await fetchNextApi<{
    memories: Entry[]
  }>('/api/pinecone/fetchMemories', {
    method: 'POST',
    body: JSON.stringify({ ...options }),
  })
  return resp.response?.memories ?? []
}
