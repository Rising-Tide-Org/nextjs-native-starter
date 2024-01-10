import { GPTModel } from './models'

export const kPromptGenerationsPerDay = 2
export const kWeeklyReportEntryLimit = 20

// Usage limitations
export const kMaxContextWindowCharacters: Record<GPTModel, number> = {
  'gpt-4-1106-preview': 48000,
  'gpt-4-0613': 22000,
  'gpt-4': 22000,
  'gpt-3.5-turbo-16k': 32000,
  'gpt-3.5-turbo': 16000,
  'gpt-3.5-turbo-0613': 16000,
  'gpt-3.5-turbo-16k-0613': 32000,
  'gpt-3.5-turbo-1106': 16000,
}

export const kFreeDigDeeperLimitPerEntry = 6
export const kPremiumDigDeeperLimitPerEntry = 20

export const kFreeDigDeeperSoftLimitPerDay = 18
export const kPremiumDigDeeperSoftLimitPerDay = 36

export const kFreeDigDeeperHardLimitPerDay = 80
export const kPremiumDigDeeperHardLimitPerDay = 80
