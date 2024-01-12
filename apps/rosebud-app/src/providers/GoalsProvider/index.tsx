import { fetchOne } from 'db/fetch'
import { createRecord, deleteRecord, updateRecord } from 'db/mutate'
import { limit, query, where } from 'firebase/firestore'
import useFetchMany from 'shared/hooks/useFetchMany'
import Analytics from 'lib/analytics'
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react'
import { CollectionItemGoal } from 'types/Collection'
import { getFuzzyDate } from 'util/date'
import { updateGoalStats } from 'util/stats'

type GoalsProviderContextType = {
  goals?: CollectionItemGoal[]
  completeGoal: (goalId: string) => Promise<boolean>
  unCompleteGoal: (goalId: string) => Promise<boolean>
  addGoal: (goal: CollectionItemGoal) => Promise<string | undefined>
  updateGoal: (goalId: string, goal: CollectionItemGoal) => Promise<boolean>
  deleteGoal: (goalId: string) => Promise<boolean>
}

const defaultGoalsContext = {
  goals: [],
}

export const GoalsProviderContext = createContext<GoalsProviderContextType>(
  defaultGoalsContext as unknown as GoalsProviderContextType
)

/**
 * React hook that reads from `GoalsProvider` context
 * Returns modal disclosure control for generalized modals
 */
export const useGoalsProvider = () => {
  const context = useContext(GoalsProviderContext)
  if (context === undefined) {
    throw new Error('useGoalsProvider must be used within a GoalsProvider')
  }
  return context
}

type Props = {
  children: ReactNode
}

export function GoalsProvider({ children }: Props) {
  const { data: dbGoals } = useFetchMany<CollectionItemGoal>(
    'items',
    (q) => query(q, where('type', '==', 'goal'), limit(100)),
    { subscribe: true }
  )

  // Avoid hydration mismatch
  const goals = useMemo(() => dbGoals, [dbGoals])

  /**
   * Complete a goal
   */
  const completeGoal = useCallback(async (goalId: string): Promise<boolean> => {
    Analytics.trackEvent('goals.complete')

    try {
      const goal = await fetchOne<CollectionItemGoal>('items', goalId)

      if (goal) {
        const date = getFuzzyDate()

        // If the goal is already completed, do nothing
        if (goal.metadata.completions?.includes(date)) return false

        const completions = [...(goal.metadata.completions ?? []), date]

        const metadata = {
          ...goal.metadata,
          completions,
        }

        try {
          await updateRecord<CollectionItemGoal>('items', goalId, {
            metadata,
          })
          await updateGoalStats(1)
          Analytics.trackEvent('goals.complete.success', { metadata })

          return true
        } catch (error) {
          Analytics.trackEvent('goals.complete.error', {
            metadata,
            error: error?.message,
          })

          console.error(error)

          return false
        }
      }
    } catch (error) {
      Analytics.trackEvent('goals.complete.error', {
        error: error?.message,
      })
      console.error(error)
    }

    return false
  }, [])

  /**
   * Reverse goal completion
   */
  const unCompleteGoal = useCallback(
    async (goalId: string): Promise<boolean> => {
      Analytics.trackEvent('goals.uncomplete')

      try {
        const goal = await fetchOne<CollectionItemGoal>('items', goalId)

        if (goal) {
          const date = getFuzzyDate()

          // If the goal is already uncompleted, do nothing
          if (!goal.metadata.completions?.includes(date)) return true

          const completions = [
            ...goal.metadata.completions.filter((c) => c !== date),
          ]

          const metadata = {
            ...goal.metadata,
            completions,
          }

          try {
            await updateRecord<CollectionItemGoal>('items', goalId, {
              metadata,
            })
            await updateGoalStats(-1)
            Analytics.trackEvent('goals.uncomplete.success', { metadata })

            return true
          } catch (error) {
            Analytics.trackEvent('goals.uncomplete.error', {
              metadata,
              error: error?.message,
            })

            console.error(error)

            return false
          }
        }
      } catch (error) {
        Analytics.trackEvent('goals.uncomplete.error', {
          error: error?.message,
        })
        console.error(error)
      }
      return false
    },
    []
  )

  /**
   * Add a goal
   */
  const addGoal = useCallback(
    async (goal: CollectionItemGoal): Promise<string | undefined> => {
      Analytics.trackEvent('goals.add', { metadata: goal.metadata })

      try {
        const item = await createRecord<CollectionItemGoal>('items', goal)
        Analytics.trackEvent('goals.add.success', { metadata: goal.metadata })
        // AK: not sure why item undefined or no id would happen or be considered a success?
        return item?.id ?? ''
      } catch (error) {
        console.error(error)
        Analytics.trackEvent('goals.add.error', {
          metadata: goal.metadata,
          error: error?.message,
        })
      }
    },
    []
  )

  /**
   * Update a goal
   */
  const updateGoal = useCallback(
    async (goalId: string, goal: CollectionItemGoal): Promise<boolean> => {
      try {
        await updateRecord<CollectionItemGoal>('items', goalId, goal)
        return true
      } catch (error) {
        console.error(error)
        return false
      }
    },
    []
  )

  /**
   *  Delete a goal
   */
  const deleteGoal = useCallback(async (goalId: string): Promise<boolean> => {
    Analytics.trackEvent('goals.delete')
    try {
      await deleteRecord('items', goalId)
      Analytics.trackEvent('goals.delete.success')
      return true
    } catch (error) {
      console.error(error)
      Analytics.trackEvent('goals.delete.error', { error: error?.message })
      return false
    }
  }, [])

  const context = useMemo(
    () => ({
      goals: goals ?? [],
      completeGoal,
      unCompleteGoal,
      addGoal,
      updateGoal,
      deleteGoal,
    }),
    [addGoal, completeGoal, deleteGoal, goals, unCompleteGoal, updateGoal]
  )

  return (
    <GoalsProviderContext.Provider value={context}>
      {children}
    </GoalsProviderContext.Provider>
  )
}
