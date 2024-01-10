import moment from 'moment'
import { CollectionItemGoal } from 'types/Collection'
import { getFuzzyDate } from './date'

/**
 * Returns true if the goal has been completed today
 * @returns
 */
export const isGoalCompleted = (goal: CollectionItemGoal): boolean => {
  const { completions, completionsRequired } = goal.metadata
  const completedToday = Boolean(completions?.includes(getFuzzyDate()))

  switch (goal.metadata.interval) {
    case 'weekly': {
      // if goal was marked completed today
      if (completedToday) return true
      // else if all required completions for this week have been achieved
      return getNumCompletionsThisWeek(goal) >= completionsRequired
    }
    case 'forever':
      return completedToday
    case 'once':
      return (completions ?? []).length > 0
  }
}

/**
 * Returns goals sorted into two arrays, incomplete and completed.
 */
export const getGoalsByCompletion = (goals: CollectionItemGoal[]) => {
  const isGoalOnCompletedList = (goal: CollectionItemGoal) => {
    const { interval, completionsRequired } = goal.metadata

    // weekly goals go on the completed list only once all required completions are made
    // however, isGoalCompleted() just looks at today's completions
    if (interval === 'weekly') {
      return (
        isGoalCompleted(goal) &&
        getNumCompletionsThisWeek(goal) >= completionsRequired
      )
    }

    // forever goals never get placed on the Completed list
    if (interval === 'forever') {
      return false
    }

    return isGoalCompleted(goal)
  }

  // sort newest to oldest
  goals.sort(
    (a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)
  )

  const completed: CollectionItemGoal[] = []
  const incomplete: CollectionItemGoal[] = []
  goals.forEach((goal) => {
    if (isGoalOnCompletedList(goal)) {
      completed.push(goal)
    } else {
      incomplete.push(goal)
    }
  })

  return [incomplete, completed]
}

/**
 * Returns the percentage of the goal that has been completed in the last 7 days
 * @returns
 */
export const getGoalProgress = (goal: CollectionItemGoal): number => {
  const { completions } = goal.metadata

  if (!completions?.length) return 0

  const maxDate = completions.reduce((a, b) => (a > b ? a : b))
  const lastCompletionDays = moment().diff(moment(maxDate), 'days')

  return (Math.max(0, 7 - lastCompletionDays) / 7) * 100
}

/**
 * If goal is interval == 'weekly', returns the number of times the goal has been completed in the last 7 days
 * If goal is interval == 'forever' or 'once', returns the total number of completions.
 */
export const getCompletionCount = (goal: CollectionItemGoal): number => {
  const { interval, completions } = goal.metadata

  if (interval === 'forever' || interval === 'once') {
    return (completions ?? []).length
  }

  return getNumCompletionsThisWeek(goal)
}

/**
 * Returns the number of completions since Sunday (day 0) of this week.
 */
function getNumCompletionsThisWeek(goal: CollectionItemGoal) {
  const { completions } = goal.metadata

  return (completions ?? []).filter((completion) =>
    moment(completion).isSameOrAfter(moment().day(0), 'day')
  ).length
}
