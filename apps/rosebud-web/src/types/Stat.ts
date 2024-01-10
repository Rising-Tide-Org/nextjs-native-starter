import { Identifiable } from './Generic'

export type StatInterval = 'daily' | 'weekly' | 'monthly' | 'yearly'
export type Stat = Identifiable & {
  interval: StatInterval
  period: string // e.g. '2020-01-01'
  words: number
  entries: number
  goalsCompleted: number
  longestStreak?: number
}
