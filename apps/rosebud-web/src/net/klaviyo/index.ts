import { fetchNextApi } from 'net/api'

export const createProfileKlaviyo = (email: string) =>
  fetchNextApi<string[]>('/api/klaviyo/createProfile', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
