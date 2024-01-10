export type GPTModel =
  | 'gpt-3.5-turbo'
  | 'gpt-3.5-turbo-0613'
  | 'gpt-3.5-turbo-16k'
  | 'gpt-3.5-turbo-16k-0613'
  | 'gpt-3.5-turbo-1106'
  | 'gpt-4'
  | 'gpt-4-0613'
  | 'gpt-4-1106-preview'

export const kPowerGPTModel: GPTModel = 'gpt-4-0613'
export const kSpeedGPTModel: GPTModel = 'gpt-3.5-turbo-1106'
export const kLargeSpeedGPTModel: GPTModel = 'gpt-3.5-turbo-16k-0613'

export const kGPTModelMap = {
  digDeeper: 'gpt-4-1106-preview',
  generatePrompts: kPowerGPTModel,
  generateTopicPrompts: kSpeedGPTModel,
  entryReflection: kPowerGPTModel,
  suggestCommitments: kPowerGPTModel,
  weeklyReport: kPowerGPTModel,
  extractEntities: kSpeedGPTModel,
  generatePersonalPrompts: kPowerGPTModel,
  passThru: kSpeedGPTModel,
  generateContent: [kSpeedGPTModel, kPowerGPTModel],
  compressEntries: 'gpt-3.5-turbo-16k', // Does a better and more consistent job of compression than 0613
  summarizeTopic: 'gpt-4-1106-preview',
} as const

export type ModelContextKey = keyof typeof kGPTModelMap

export const getModelByContext = (
  contextKey: ModelContextKey,
  isUserPremium: boolean,
  defaultModel: string = kSpeedGPTModel,
  advancedModelEnabled = true
): GPTModel => {
  if (!kGPTModelMap[contextKey]) {
    throw new Error(`No GPT model found for context: ${contextKey}`)
  }

  if (contextKey === 'digDeeper' && advancedModelEnabled === false) {
    // TODO: Remove after experiment ends
    return kSpeedGPTModel
  }

  if (Array.isArray(kGPTModelMap[contextKey])) {
    return kGPTModelMap[contextKey][isUserPremium ? 1 : 0] as GPTModel
  }

  return (kGPTModelMap[contextKey] as GPTModel) || defaultModel
}
