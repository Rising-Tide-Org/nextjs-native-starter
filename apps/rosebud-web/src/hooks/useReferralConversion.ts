import { useCallback } from 'react'
import { ReferralConversionStage } from 'constants/referral'
import { fetchNextApi } from 'net/api'
import Analytics from 'lib/analytics'
import useLocalStorage from 'hooks/useLocalStorage'
import { kLSAppPrefix } from 'constants/localStorage'
import { firebaseAuth } from 'db'

const updateReferralStage = async (
  stage: ReferralConversionStage,
  uid: string,
  referralCode?: string
) => {
  try {
    await fetchNextApi<undefined>('/api/referral/referralConversion', {
      method: 'POST',
      body: JSON.stringify({
        stage,
        uid,
        ...(referralCode ? { referralCode } : {}),
      }),
      headers: {
        Accept: 'application/json',
      },
    })

    Analytics.trackEvent('referral.stage.success', {
      stage: ReferralConversionStage[stage],
      referralCode,
    })
  } catch (error) {
    console.error(error)
    Analytics.trackEvent('referral.stage.error', {
      stage: ReferralConversionStage[stage],
      referralCode,
      error,
    })
  }
}

export const useReferralConversion = () => {
  const [referralCode, setReferralCode] = useLocalStorage<string | null>(
    `${kLSAppPrefix}/referralCode`,
    null
  )

  const triggerReferralStage = useCallback(
    async (stage: ReferralConversionStage, code = referralCode) => {
      // We should skip this for users who are not logged in or were not referred
      const authUser = firebaseAuth.currentUser
      if (!authUser || !code) {
        return
      }

      if (stage === ReferralConversionStage.initial && code) {
        await updateReferralStage(stage, authUser.uid, code)
        setReferralCode(null)
      } else if (
        [
          ReferralConversionStage.signup,
          ReferralConversionStage.trial,
        ].includes(stage)
      ) {
        await updateReferralStage(stage, authUser.uid)
      }
    },
    [referralCode, setReferralCode]
  )

  return triggerReferralStage
}
