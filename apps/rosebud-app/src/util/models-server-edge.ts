import {
  getModelByContext,
  GPTModel,
  kSpeedGPTModel,
  ModelContextKey,
} from 'constants/models'
import { User } from 'types/User'

const GPT_DOWNGRADE_EMERGENCY_SWITCH =
  process.env.GPT_DOWNGRADE_EMERGENCY_SWITCH

export const getGPTModelForStream = (
  contextKey: ModelContextKey,
  user?: Partial<User>
): GPTModel => {
  const userSubscriptionStatus = user?.subscription?.status
  const isUserPremium =
    userSubscriptionStatus === 'active' || userSubscriptionStatus === 'trialing'
  if (GPT_DOWNGRADE_EMERGENCY_SWITCH && !isUserPremium) {
    // If the emergency switch is on, downgrade to the default model (which should be the cheapest)
    return kSpeedGPTModel
  }

  return getModelByContext(
    contextKey,
    isUserPremium,
    undefined,
    user?.settings?.advancedModelEnabled
  )
}
