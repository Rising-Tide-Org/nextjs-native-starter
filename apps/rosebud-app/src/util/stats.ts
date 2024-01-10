import { fetchMany } from 'db/fetch'
import { createRecord, updateRecord, updateRecordBatch } from 'db/mutate'
import { query, where, increment } from 'firebase/firestore'
import moment from 'moment'
import { Entry } from 'types/Entry'
import { Stat, StatInterval } from 'types/Stat'
import { entryWordCount } from './entries'

/**
 * Get the stats for the current day, week, month, and year. Creates the stats if they don't exist.
 * @param date
 * @returns The stats for the current day, week, month, and year.
 */
export const getStats = async (date: Date = new Date()): Promise<Stat[]> => {
  const year = moment(date).format('YYYY')
  const month = moment(date).format('YYYY-MM')
  const week = moment(date).format('YYYY-WW')
  const day = moment(date).format('YYYY-MM-DD')

  const ids = [
    `yearly-${year}`,
    `monthly-${month}`,
    `weekly-${week}`,
    `daily-${day}`,
  ]

  const currentStats = await fetchMany<Stat>('stats', (q) =>
    query(q, where('id', 'in', ids))
  )

  let created = false

  for (const id of ids) {
    if (!currentStats.find((s) => s.id === id)) {
      // Create the stat
      await createRecord<Stat>(
        'stats',
        {
          period: id.split('-')[1],
          interval: id.split('-')[0] as StatInterval,
          entries: 0,
          words: 0,
          goalsCompleted: 0,
        },
        id
      )
      created = true
    }
  }

  if (created) {
    return await getStats(date)
  }

  return currentStats
}

/**
 * Update the stats for the current day, week, month, and year given an entry.
 * @param entry
 * @returns
 */
export const updateEntryStats = async (entry: Entry, remove = false) => {
  const currentStats = await getStats(moment(entry.day).toDate())
  if (currentStats.length === 0) {
    return
  }

  const wordCount = entryWordCount(entry)

  await updateRecordBatch<Stat>(
    'stats',
    currentStats.map((s) => ({
      id: s.id!,
      data: {
        words: increment((remove ? -1 : 1) * wordCount),
        entries: increment(remove ? -1 : 1),
      },
    }))
  )
}

export const updateStatsLongestStreak = async (currentStreak: number) => {
  const currentStats = await getStats()
  if (currentStats.length === 0) {
    return
  }

  const currentYear = moment().format('YYYY')
  const currentYearStats = currentStats.find(
    (s) => s.interval === 'yearly' && s.period === currentYear
  )

  if (
    currentYearStats &&
    currentStreak > (currentYearStats.longestStreak ?? 0)
  ) {
    await updateRecord<Stat>('stats', currentYearStats.id!, {
      longestStreak: currentStreak,
    })
  }
}

export const updateGoalStats = async (incrementBy = 1) => {
  const currentStats = await getStats()
  if (currentStats.length === 0) {
    return
  }

  await updateRecordBatch<Stat>(
    'stats',
    currentStats.map((s) => ({
      id: s.id!,
      data: {
        goalsCompleted: increment(incrementBy),
      },
    }))
  )
}
