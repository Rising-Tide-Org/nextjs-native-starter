import { fetchNextApi } from 'net/api'

export const checkMigrations = () =>
  fetchNextApi<string[]>('/api/checkMigrations', {
    method: 'GET',
  })
