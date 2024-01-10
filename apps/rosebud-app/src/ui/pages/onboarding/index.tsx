import { Box } from '@chakra-ui/react'
import { kDefaultPersonalizationId } from 'constants/defaults'
import { onboardingTips } from 'constants/onboarding'
import { kOnboardingUserFields } from 'constants/onboarding'
import { createRecord } from 'db/mutate'
import { AnimatePresence } from 'framer-motion'
import Analytics from 'lib/analytics'
import navigator from 'lib/routes'
import { useRouter } from 'next/router'
import { useUserProvider } from 'providers/UserProvider'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ComposeResponse, ComposeTemplate } from 'types/Compose'
import { UserFlag } from 'types/User'
import { kGlobalLayoutWidthNarrow } from 'ui/constants'
import MotionBox from 'ui/core/MotionBox'
import { generateBioAndToneFromOnboarding } from 'util/onboarding'
import Compose from '../compose'
import OnboardingTip from './OnboardingTip'

type OnboardingValueType = { [key: string]: string | string[] }

const Onboarding = () => {
  const { updateUser, user, setUserFlag, updateUserFields } = useUserProvider()
  const router = useRouter()
  const boxRef = useRef<HTMLDivElement>(null)
  const [onboardingTip, setOnboardingTip] = useState<string | undefined>()

  useEffect(() => {
    if (user?.variants?.onboarding && !user.onboarding) {
      Analytics.trackEvent('onboarding.view', {
        variant: user.variants.onboarding,
      })
      // This tracks time to eventual onboarding.complete, if user reloads in the middle of onboarding steps,
      // we do not dispatch it again
      Analytics.timeEvent('onboarding.complete')
    }
  }, [user])

  const templateId = String(user?.variants?.onboarding ?? 'onboarding-v5')

  /**
   * If the user has already completed the onboarding flow, redirect them back
   */
  useEffect(() => {
    if (user?.flags?.[UserFlag.onboardingComplete]) {
      router.push(navigator.home)
    }
    // We only want this to happen on load, not as data changes to avoid premature redirect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * As the user progresses through the onboarding flow, we want to update their
   * onboarding values in the database.
   */
  const handleChange = useCallback(
    async (responses: ComposeResponse[], template: ComposeTemplate) => {
      const onboardingValues: OnboardingValueType = responses
        .filter((r) => Boolean(r.id) && kOnboardingUserFields.includes(r.id!))
        .reduce((acc, r) => {
          // If there is only one response, we can just set the value directly
          if (r.response.length > 1) {
            acc[r.id!] = r.response.map((s) => s.trim())
          } else {
            acc[r.id!] = r.response[0]?.trim()
          }
          return acc
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        }, {} as OnboardingValueType)

      updateUser({ onboarding: onboardingValues })

      // Show onboarding tips until the user hits the rose bud thorn
      if (responses.find((r) => r.id === 'interstitial')) {
        setOnboardingTip(undefined)
      } else {
        setOnboardingTip(onboardingTips[responses.length - 1])
      }

      // Create personalization
      if (
        responses[responses.length - 1].id === 'interstitial' &&
        templateId === 'onboarding-v6'
      ) {
        const { bio, toneAndStyle } =
          generateBioAndToneFromOnboarding(responses)

        const doc = await createRecord(
          'personalizations',
          { toneAndStyle },
          kDefaultPersonalizationId
        )
        await updateUserFields({
          'profile.bio': bio,
          'settings.personalizationId': doc?.id,
        })
      }

      // Track the step completion
      const lastResponse = responses[responses.length - 1]
      const stepNumber =
        template.prompts.findIndex((p) => p.id === lastResponse.id) + 1
      if (stepNumber > -1) {
        const prompt = lastResponse.prompt.content
          ?.slice(-1)?.[0]
          ?.replace(/[^a-zA-Z0-9 .,!?]/g, '')

        Analytics.trackEvent('onboarding.step.complete', {
          step: stepNumber,
          variant: templateId,
          subVariant: template.saveId,
          promptId: lastResponse.id,
          prompt,
        })
      }
    },
    [updateUser, templateId]
  )

  // eslint-disable-next-line unused-imports/no-unused-vars
  const handleSkip = useCallback(
    async (responses: ComposeResponse[]) => {
      await setUserFlag(UserFlag.onboardingComplete, true)
      Analytics.trackEvent('onboarding.skip', {
        step: responses.length,
        variant: templateId,
      })
      router.push(navigator.home, undefined, { shallow: true })
    },
    [setUserFlag, templateId, router]
  )

  if (!user || user?.flags?.[UserFlag.onboardingComplete] || !templateId) {
    return null
  }

  return (
    <Box
      overflow='hidden'
      position='relative'
      h={{ base: '100vh', md: '90vh' }}
      maxH='1024px'
      top={{ base: 0, md: '50%' }}
      left={{ base: 0, md: '50%' }}
      transform={{ base: 'none', md: 'translate(-50%, -50%)' }}
      w={{ base: 'full', md: '640px' }}
      boxShadow={{ base: 'none', md: '0px 0px 16px rgba(0, 0, 0, 0.05)' }}
      ref={boxRef}
    >
      <Compose
        templateId={templateId}
        onChange={handleChange}
        onSkip={handleSkip}
        returnTo={navigator.home}
      />
      <AnimatePresence>
        {onboardingTip && (
          <MotionBox
            key={onboardingTip}
            initial={{
              opacity: 0,
              x: -(boxRef.current?.clientWidth ?? kGlobalLayoutWidthNarrow),
            }}
            animate={{ opacity: 1, x: 0 }}
            exit={{
              opacity: 0,
              x: boxRef.current?.clientWidth ?? kGlobalLayoutWidthNarrow,
            }}
            transition={{ duration: 0.7, ease: [0.43, 0.13, 0.23, 1] }}
            position='absolute'
            overflow='hidden'
            bottom={{ base: 0, md: 2 }}
            left={{ base: 0, md: 2 }}
            right={{ base: 0, md: 2 }}
          >
            <OnboardingTip>{onboardingTip}</OnboardingTip>
          </MotionBox>
        )}
      </AnimatePresence>
    </Box>
  )
}

export default Onboarding
