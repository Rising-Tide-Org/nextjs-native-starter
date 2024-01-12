import { fetchOne } from 'db/fetch'
import { createRecord, updateRecord } from 'db/mutate'
import { arrayUnion } from 'firebase/firestore'
import useFetchOne from 'shared/hooks/useFetchOne'
import moment from 'moment'
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react'
import { Streak, StreakCompletion, StreakInterval } from 'types/Streak'
import { getFuzzyDate } from 'util/date'
import { updateStatsLongestStreak } from 'util/stats'

type StreakProviderContextType = {
  streak: Streak | null
  completions: StreakCompletion[]
  updateStreak: (streakId: string, item: StreakCompletion) => Promise<void>
}

const defaultContext = {
  streak: null,
  completions: [],
  updateStreak: async () => {},
} as unknown as StreakProviderContextType

export const StreakProviderContext =
  createContext<StreakProviderContextType>(defaultContext)

/**
 * React hook that reads from `StreakProvider` context
 */
export const useStreakProvider = () => {
  const context = useContext(StreakProviderContext)
  if (context === undefined) {
    throw new Error('useStreakProvider must be used within a StreakProvider')
  }
  return context
}

type Props = {
  children: ReactNode
}

export function StreakProvider({ children }: Props) {
  const { data } = useFetchOne<Streak>('streaks', 'daily', {
    subscribe: true,
  })

  /**
   * We only want to return a streak if the latest completion
   * was today or yesterday, otherwise null
   */
  const streak: Streak | null = useMemo(() => {
    if (!data?.completions) {
      return null
    }
    const lastCompletion = [...data.completions]
      ?.sort((a, b) => (b.day < a.day ? 1 : -1))
      .slice(-1)[0]

    if (
      data &&
      lastCompletion &&
      moment(lastCompletion.day).isAfter(
        moment(getFuzzyDate()).subtract(2, 'days')
      )
    ) {
      return data
    } else if (data.current === 1) {
      // Reset the streak to 0 if it's not active
      updateRecord<Streak>('streaks', 'daily', {
        current: 0,
      })
    }
    return null
  }, [data])

  /**
   *
   * @param entry
   */
  const updateStreak = useCallback(
    async (
      streakId: string,
      newCompletion: StreakCompletion
    ): Promise<void> => {
      const currentStreak = await fetchOne<Streak>('streaks', streakId)

      if (
        currentStreak === null ||
        (currentStreak && !currentStreak?.completions)
      ) {
        // New streak, first time ever
        // TODO: this will need to be updated when new types of streaks are added
        await createRecord<Streak>(
          'streaks',
          {
            current: 1,
            longest: 1,
            completionsRequired: 1,
            interval: 'daily',
            completions: [newCompletion],
            lastItemId: newCompletion.itemId,
          },
          streakId
        )

        // Set longest streak first time ever
        await updateStatsLongestStreak(1)
      } else if (currentStreak) {
        // Existing streak, let's update it

        // Skip if this completion requirement is already met
        if (
          currentStreak.completions.filter((c) => c.day === newCompletion.day)
            .length >= currentStreak.completionsRequired
        ) {
          return
        }

        // First, we build an array of completions, sorted in descending order,
        // then we iterate through the array to determine the current streak, if any

        const completions = [newCompletion, ...currentStreak.completions].map(
          (c) => c.day
        )
        completions.sort((a, b) => moment(b).diff(moment(a)))

        const completionsRequired = currentStreak.completionsRequired
        const timePeriod = currentStreak.interval === 'daily' ? 'day' : 'week'

        let newStreak = 0
        let completionCount = 0
        let previousDate: moment.Moment | null = null
        const completedPeriods = new Set<string>() // Used to ignore duplicate completions

        for (const completion of completions) {
          const completionDate = moment(completion)

          if (completedPeriods.has(completion)) {
            // Skip this completion if it's already been counted
            continue
          }

          // Check if it's the first iteration or if the completion is in the expected interval
          if (
            previousDate === null ||
            isConsecutive(
              previousDate,
              completionDate,
              currentStreak.interval
            ) ||
            (completionsRequired > completionCount &&
              completionDate.isSame(previousDate, timePeriod))
          ) {
            completionCount++

            // If completionsRequired is met, increment streak
            if (completionCount >= completionsRequired) {
              newStreak++
              completionCount = 0 // Reset count for the next streak
              completedPeriods.add(completion)
            }

            // If the previous date is not the same as the current date, reset the count
            if (
              previousDate &&
              !previousDate.isSame(completionDate, timePeriod)
            ) {
              completionCount = 0
            }

            previousDate = completionDate
          } else {
            // Streak broken
            break
          }
        }

        // Check if this is the first completion of a new streak
        const isStartingStreak =
          newStreak === 1 &&
          currentStreak.completions[0].day !== newCompletion.day &&
          newCompletion.day > currentStreak.completions[0].day

        // Only update the streak if it has changed, or when the streak is starting again
        // TODO: When we support multiple completions per period, we'll need to change this
        if (newStreak !== currentStreak.current || isStartingStreak) {
          const longestStreak = Math.max(newStreak, currentStreak.longest)

          await updateRecord<Streak>('streaks', streakId, {
            current: newStreak,
            longest: longestStreak,
            completions: arrayUnion(newCompletion),
            lastItemId: newCompletion.itemId,
          })

          await updateStatsLongestStreak(longestStreak)
        } else {
          // If the streak hasn't changed, just add the new completion
          await updateRecord<Streak>('streaks', streakId, {
            completions: arrayUnion(newCompletion),
          })
        }
      }
    },
    []
  )

  const context = useMemo(
    () => ({
      streak,
      completions: data?.completions ?? [],
      updateStreak,
    }),
    [data?.completions, streak, updateStreak]
  )

  return (
    <StreakProviderContext.Provider value={context}>
      {children}
    </StreakProviderContext.Provider>
  )
}

function isConsecutive(
  previousDate: moment.Moment,
  currentDate: moment.Moment,
  interval: StreakInterval
): boolean {
  if (interval === 'daily') {
    return previousDate.clone().subtract(1, 'days').isSame(currentDate, 'day')
  } else {
    // weekly
    return previousDate
      .clone()
      .subtract(1, 'weeks')
      .startOf('isoWeek')
      .isSame(currentDate.startOf('isoWeek'), 'week')
  }
}
