import {
  getModelByContext,
  GPTModel,
  kSpeedGPTModel,
  ModelContextKey,
} from 'constants/models'
import AnalyticsServer from 'lib/analytics-server'
import { User } from 'types/User'

const GPT_DOWNGRADE_EMERGENCY_SWITCH =
  process.env.GPT_DOWNGRADE_EMERGENCY_SWITCH

export const getGPTModel = (
  contextKey: ModelContextKey,
  user: User | Partial<User>,
  modelOverride: GPTModel = kSpeedGPTModel
): GPTModel => {
  const userSubscriptionStatus = user.subscription?.status
  const isUserPremium =
    userSubscriptionStatus === 'active' || userSubscriptionStatus === 'trialing'

  if (GPT_DOWNGRADE_EMERGENCY_SWITCH && !isUserPremium) {
    AnalyticsServer.init()
    AnalyticsServer.trackEvent(user.uuid as string, 'gpt-emergency.trigger', {
      contextKey,
    })

    // If the emergency switch is on, downgrade to the default model (which should be the cheapest)
    return modelOverride
  }

  return getModelByContext(contextKey, isUserPremium, modelOverride)
}
