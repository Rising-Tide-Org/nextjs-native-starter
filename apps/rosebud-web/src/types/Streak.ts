import { Timestamp } from 'firebase/firestore'

/**
 * Example: Drink water 3 times daily
 * {
 *   interval: 'daily',
 *   completionsRequired: 3,
 *   current: 2,
 *   longest: 5,
 *   completions: [
 *     {
 *       day: '2021-01-01',
 *       date: '2021-01-01T08:23:04.000Z',
 *     }
 *     ...more
 *   ],
 * }
 */

export type Streak = {
  interval: StreakInterval // Interval of this streak (e.g. daily, weekly)
  completionsRequired: number // Number of completions required to complete this streak (e.g. drink water 3 times daily)
  current: number // Current streak (e.g. 2)
  longest: number // Longest streak (e.g. 5)
  completions: StreakCompletion[] // History of every completion of this streak
  lastItemId?: string // ID of the last item that triggered the streak (e.g. entry id)
}

export type StreakInterval = 'daily' | 'weekly'

export type StreakCompletion = {
  day: string // Day of completion (e.g. 2021-01-01)
  date: Timestamp // Date of completion (e.g. 2021-01-01T00:00:00.000Z)
  itemId: string // ID of the item that triggered this completion (e.g. entry id)
}
