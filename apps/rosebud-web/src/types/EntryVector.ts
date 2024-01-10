export enum EntryChunkingMode {
  None = 'none',
  PerMultipleQuestions = 'multiple',
  PerQuestion = 'single',
}

export type EntryVectorMetadata = {
  userUuid: string
  entryId: string
  chunkingMode: EntryChunkingMode
  date?: string
  timestamp?: number
  questionIndices?: string
  responseSubstringRange?: string // "start,finish"
  content?: string
}

export type EntryVector = {
  id: string
  values: number[]
  metadata: EntryVectorMetadata
  score?: number
}

export type CombinedEntryVector = {
  id: string
  date?: string
  questionIds: number[]
  score?: number
  questionResponseRanges?: Record<number, number[] | undefined> // [start, finish]
}

export type TimestampRange = {
  after?: number
  before?: number
}
