import { CollectionItemTopic } from './Collection'
import { ComposeResponse } from './Compose'
import { Identifiable } from './Generic'

export type Emotion = {
  label: string
  emoji: string
}

export type Entry = Identifiable & {
  day?: string
  date?: string
  isDraft?: boolean
  questions: ComposeResponse[]
  summary?: {
    title: string
    content: string
  }
  commitments: string[]
  entities?: Entities
  templateId?: string
  tags?: CollectionItemTopic[]
  tagIndex?: string[]
  rewardId?: string
}

export type Person = {
  name: string
  relation: string
}

export type Entities = {
  emotions: Emotion[]
  people: Person[]
  places: string[]
  topics: string[]
}

export type EntityTypes = 'emotions' | 'people' | 'places' | 'topics'

export type EntityCount = {
  unique_count: number
  ranked: { [key: string]: number }[]
}

export type EntityCounts = {
  [key in EntityTypes]: EntityCount
}
