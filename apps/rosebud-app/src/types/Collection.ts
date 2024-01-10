import { Timestamp } from 'firebase/firestore'
import { Identifiable } from './Generic'

export const kCollectionItemTypes = [
  'quote',
  'haiku',
  'affirmation',
  'proverb',
  'ask',
  'topic',
  'prompt',
  'milestone',
  'goal',
] as const
export type CollectionItemType = (typeof kCollectionItemTypes)[number]

export type CollectionItem = Identifiable & {
  parentId?: string | null
  type: CollectionItemType
  emoji?: string
  title?: string
  description?: string
  image?: string
  content?: string
  metadata?: { [key: string]: string | number | boolean | string[] }
  references?: { entries: string[] }
  createdBy?: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export type CollectionItemTopicType = 'theme' | 'person' | 'emotion'

export type CollectionItemTopic = CollectionItem & {
  type: 'topic'
  metadata: {
    type: CollectionItemTopicType
    isFocusArea?: boolean
    mentions?: number
    lastPageGeneration?: Timestamp
  }
}

export type CollectionItemGoalInterval = 'weekly' | 'once' | 'forever'

export const intervalToLabelMap: Record<CollectionItemGoalInterval, string> = {
  weekly: 'Habit',
  once: 'Action',
  forever: 'Value',
}

/**
 * Goal is the broad term for habits, actions, and values representing
 * happiness recipe ingradients of interval: weekly, once, and forever, respectively.
 */
export type CollectionItemGoal = CollectionItem & {
  type: 'goal'
  metadata: {
    interval: CollectionItemGoalInterval
    completionsRequired: number
    completions?: string[] // ["2023-12-10"]
  }
}

export type CollectionItemPrompt = CollectionItem & {
  type: 'prompt'
  metadata: {
    isBookmarked?: boolean
    isAnswered?: boolean
  }
}

export type CollectionItemMilestone = CollectionItem & {
  type: 'milestone'
  metadata: {
    day?: string
  }
}
