import moment from 'moment'
import { CollectionItemGoal } from 'types/Collection'
import { isGoalCompleted } from '../goals'

describe('Goals Utils', () => {
  const today = moment().format('YYYY-MM-DD')
  const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD')
  const twoDaysAgo = moment().subtract(2, 'days').format('YYYY-MM-DD')

  it('Returns the completed status of one-time happiness ingredients', () => {
    const once: CollectionItemGoal = {
      type: 'goal',
      metadata: {
        interval: 'once',
        completions: [],
        completionsRequired: 0,
      },
    }
    expect(isGoalCompleted(once)).toEqual(false)

    once.metadata.completions = ['2023-12-01']
    expect(isGoalCompleted(once)).toEqual(true)
  })

  it('Returns the completed status of forever ingredients', () => {
    const forever: CollectionItemGoal = {
      type: 'goal',
      metadata: {
        interval: 'forever',
        completions: [today],
        completionsRequired: 0,
      },
    }
    expect(isGoalCompleted(forever)).toEqual(true)

    forever.metadata.completions = [yesterday]
    expect(isGoalCompleted(forever)).toEqual(false)
  })

  it('Returns the completed status of weekly ingredients', () => {
    const weekly: CollectionItemGoal = {
      type: 'goal',
      metadata: {
        interval: 'weekly',
        completions: [twoDaysAgo, yesterday],
        completionsRequired: 3,
      },
    }
    expect(isGoalCompleted(weekly)).toEqual(false)

    weekly.metadata.completions = [twoDaysAgo, yesterday, today]
    expect(isGoalCompleted(weekly)).toEqual(true)
  })
})
