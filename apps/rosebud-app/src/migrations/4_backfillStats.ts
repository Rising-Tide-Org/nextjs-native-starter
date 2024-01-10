import { firestore } from 'firebase-admin'
import moment from 'moment'
import { Entry } from 'types/Entry'
import { Goal } from 'types/Goal'
import { MigrationMetadata } from 'types/Migration'
import { Stat } from 'types/Stat'
import { Streak } from 'types/Streak'
import { entryWordCount } from 'util/entries'
import { RunnableMigration } from './RunnableMigration'

/**
 * The class name will be used to indicate this migration in firestore.
 * Use the following filename format to keep things organized: <migrationIndex>_<className>
 */
export class BackfillStats extends RunnableMigration {
  className = 'BackfillStats'

  async up(
    trx: firestore.Transaction,
    userRef: firestore.DocumentReference<firestore.DocumentData>
  ): Promise<MigrationMetadata | undefined> {
    const entriesSnapshot = await trx.get(userRef.collection('entries'))
    const goalsSnapshot = await trx.get(userRef.collection('goals'))
    const streakSnapshot = await trx.get(
      userRef.collection('streaks').doc('daily')
    )

    const entries = entriesSnapshot.docs.map((d) => d.data() as Entry)
    const goals = goalsSnapshot.docs.map((d) => d.data() as Goal)
    const streak = streakSnapshot.data() as Streak

    // Build daily, monthly, weekly, yearly stats
    const dailyStats: Record<string, Stat> = {}
    const monthlyStats: Record<string, Stat> = {}
    const weeklyStats: Record<string, Stat> = {}
    const yearlyStats: Record<string, Stat> = {}

    for (const entry of entries) {
      const day = moment(entry.day).format('YYYY-MM-DD')
      const month = moment(entry.day).format('YYYY-MM')
      const week = moment(entry.day).format('YYYY-WW')
      const year = moment(entry.day).format('YYYY')

      if (!dailyStats[day]) {
        dailyStats[day] = {
          id: `daily-${day}`,
          period: day,
          interval: 'daily',
          entries: 0,
          words: 0,
          goalsCompleted: 0,
        }
      }

      if (!monthlyStats[month]) {
        monthlyStats[month] = {
          id: `monthly-${month}`,
          period: month,
          interval: 'monthly',
          entries: 0,
          words: 0,
          goalsCompleted: 0,
        }
      }

      if (!weeklyStats[week]) {
        weeklyStats[week] = {
          id: `weekly-${week}`,
          period: week,
          interval: 'weekly',
          entries: 0,
          words: 0,
          goalsCompleted: 0,
        }
      }

      if (!yearlyStats[year]) {
        yearlyStats[year] = {
          id: `yearly-${year}`,
          period: year,
          interval: 'yearly',
          entries: 0,
          words: 0,
          goalsCompleted: 0,
          longestStreak: streak?.longest ?? 0,
        }
      }

      dailyStats[day].entries += 1
      dailyStats[day].words += entryWordCount(entry)

      monthlyStats[month].entries += 1
      monthlyStats[month].words += entryWordCount(entry)

      weeklyStats[week].entries += 1
      weeklyStats[week].words += entryWordCount(entry)

      yearlyStats[year].entries += 1
      yearlyStats[year].words += entryWordCount(entry)
    }

    // Goals
    for (const completion of goals.flatMap((g) => g.completions)) {
      const day = moment(completion).format('YYYY-MM-DD')
      const month = moment(completion).format('YYYY-MM')
      const week = moment(completion).format('YYYY-WW')
      const year = moment(completion).format('YYYY')

      if (!dailyStats[day]) {
        dailyStats[day] = {
          id: `daily-${day}`,
          period: day,
          interval: 'daily',
          entries: 0,
          words: 0,
          goalsCompleted: 0,
        }
      }

      if (!monthlyStats[month]) {
        monthlyStats[month] = {
          id: `monthly-${month}`,
          period: month,
          interval: 'monthly',
          entries: 0,
          words: 0,
          goalsCompleted: 0,
        }
      }

      if (!weeklyStats[week]) {
        weeklyStats[week] = {
          id: `weekly-${week}`,
          period: week,
          interval: 'weekly',
          entries: 0,
          words: 0,
          goalsCompleted: 0,
        }
      }

      if (!yearlyStats[year]) {
        yearlyStats[year] = {
          id: `yearly-${year}`,
          period: year,
          interval: 'yearly',
          entries: 0,
          words: 0,
          goalsCompleted: 0,
        }
      }

      dailyStats[day].goalsCompleted += 1
      monthlyStats[month].goalsCompleted += 1
      weeklyStats[week].goalsCompleted += 1
      yearlyStats[year].goalsCompleted += 1
    }

    const stats = [dailyStats, monthlyStats, weeklyStats, yearlyStats].flatMap(
      (s) => Object.values(s)
    )
    for (const stat of stats) {
      const statRef = userRef.collection('stats').doc(stat.id!)
      trx.set(statRef, stat)
    }

    return {
      statsCreated: stats.length,
      yearlyStatsCreated: Object.keys(yearlyStats).length,
      monthlyStatsCreated: Object.keys(monthlyStats).length,
      weeklyStatsCreated: Object.keys(weeklyStats).length,
      dailyStatsCreated: Object.keys(dailyStats).length,
    }
  }
}
