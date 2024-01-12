import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { User } from 'types/User'
import {
  PricePackage,
  Subscription,
  SubscriptionSource,
  SubscriptionTier,
} from 'types/Subscription'
import { captureException as sentryCaptureException } from '@sentry/nextjs'
import { useRouter } from 'next/router'
import getStripe from 'util/stripe-client'
import Analytics from 'lib/analytics'
import {
  createCheckoutSession,
  getSubscription,
  createPortalLink,
  createNewCustomer,
  getStripeCheckoutSession,
} from 'net/payment'
import { useDisclosure, useToast } from '@chakra-ui/react'
import UpgradeModal from 'ui/shared/modals/UpgradeModal'
import NewUpgradeModal from 'ui/shared/modals/NewUpgradeModal'
import {
  kTrialPeriodDaysForNewUsers,
  PriceDiscoveryVariant,
} from 'constants/premium'
import { useUserProvider } from 'providers/UserProvider'
import isEqual from 'lodash/isEqual'
import MakeToast from 'ui/core/MakeToast'
import navigator from 'lib/routes'
import { ReferralConversionStage } from 'constants/referral'
import { useReferralConversion } from 'shared/hooks/useReferralConversion'
import { MixpanelUserProps } from 'constants/analytics'
import ReactGA from 'react-ga4'
import { userHasVariant } from 'util/user'
import { determineSubscriptionTier } from 'util/stripe'

type SubscriptionProviderContextType = {
  isSubscriptionLoading: boolean
  subscription: Partial<Subscription> | undefined
  isSubscriptionPresent: boolean
  isSubscriptionActive: boolean
  subscriptionTier: SubscriptionTier | undefined
  memoryEnabled: boolean
  hasMemoryFeature: boolean
  showNewUpgradeModal: boolean
  subscriptionTierName: string | undefined
  openSubscribeModal: (source: SubscriptionSource) => void
  checkSubscription: () => void
  createStripeCustomer: () => Promise<string | undefined>
  redirectToCustomerPortal: () => Promise<boolean>
}

const defaultSubscriptionContext = {}

export const SubscriptionProviderContext =
  createContext<SubscriptionProviderContextType>(
    defaultSubscriptionContext as SubscriptionProviderContextType
  )

/**
 * React hook that reads from `SubscriptionProvider` context
 * Returns modal disclosure control for generalized modals
 */
export const useSubscriptionProvider = () => {
  const context = useContext(SubscriptionProviderContext)
  if (context === undefined) {
    throw new Error(
      'useSubscriptionProvider must be used within a SubscriptionProvider'
    )
  }
  return context
}

type Props = {
  children: ReactNode
}

const subscriptionSuccessToastId = 'subscription-buy-success'

export function SubscriptionProvider({ children }: Props) {
  const { user, updateUser, updateUserFields } = useUserProvider()
  const triggerReferralStage = useReferralConversion()
  const router = useRouter()
  const toast = useToast()
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false)
  const [upgradeSource, setUpgradeSource] =
    useState<SubscriptionSource>('unknown')
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)
  const subscriptionLookupRef = useRef<boolean>(false)
  const paymentRedeemedRef = useRef<boolean>(false)

  const {
    isOpen: isUpgradeModalOpen,
    onOpen: onUpgradeModalOpen,
    onClose: onUpgradeModalClose,
  } = useDisclosure()

  const { payment_id: stripeSessionId } = router.query

  const subscription = useMemo(() => {
    return user.subscription
  }, [user.subscription])

  // This represents subscription being active, meaning the user is eligible for premium features
  const isSubscriptionActive = useMemo(
    () =>
      subscription?.status === 'active' || subscription?.status === 'trialing',
    [subscription]
  )

  // This represents subscription existing in Stripe, regardless of status
  const isSubscriptionPresent = useMemo(
    () => Boolean(subscription?.id),
    [subscription]
  )

  // This represents the subscription product (eg. bloom, lite)
  const subscriptionTier = useMemo<SubscriptionTier | undefined>(() => {
    return determineSubscriptionTier(subscription?.product)
  }, [subscription?.product])

  // TODO: Remove when Bloom launches
  const hasMemoryFeature = useMemo<boolean>(
    () => userHasVariant(user, 'memory') || subscriptionTier === 'bloom',
    [user, subscriptionTier]
  )

  const memoryEnabled = useMemo<boolean>(
    () =>
      hasMemoryFeature &&
      user?.settings?.memoryEnabled === true &&
      user.metadata?.backfilledVectors === true,
    [
      hasMemoryFeature,
      user?.settings?.memoryEnabled,
      user.metadata?.backfilledVectors,
    ]
  )

  // TODO: Remove when Bloom launches
  const showNewUpgradeModal = useMemo<boolean>(
    () =>
      [
        PriceDiscoveryVariant.noDiscount,
        PriceDiscoveryVariant.withDiscount,
      ].includes(user.variants?.pricing as PriceDiscoveryVariant),
    [user.variants?.pricing]
  )

  // TODO: Remove when Bloom launches
  const subscriptionTierName = useMemo<string | undefined>(() => {
    if (subscriptionTier === 'bloom') {
      return 'Bloom'
    } else if (subscriptionTier === 'lite') {
      return 'Premium'
    }
    return undefined
  }, [subscriptionTier])

  /**
   * Create new Stripe customer
   */
  const createStripeCustomer = useCallback(async () => {
    if (!user.id || !user.uuid || user.subscription?.customerId) {
      return
    }

    const utmParams = {
      utm_source: user.metadata?.utm_source,
      utm_medium: user.metadata?.utm_medium,
      utm_campaign: user.metadata?.utm_campaign,
      utm_term: user.metadata?.utm_term,
      utm_content: user.metadata?.utm_content,
    }

    const { response: newStripeCustomerId } = await createNewCustomer(
      user.id,
      user.uuid,
      upgradeSource,
      utmParams
    )

    if (newStripeCustomerId) {
      await updateUserFields({
        ['subscription.customerId']: newStripeCustomerId,
      })
    }

    return newStripeCustomerId
  }, [user, updateUserFields, upgradeSource])

  /**
   * Fetch the subscription data from Stripe
   * @returns A subscription object, or null if it doesn't exist
   */
  const fetchSubscription = useCallback(
    async (sessionId?: string): Promise<Partial<Subscription> | undefined> => {
      const subscriptionId = user.subscription?.id
      const customerId = user.subscription?.customerId

      const { response: currentSubscription, error } = await getSubscription({
        customerId,
        subscriptionId,
        sessionId,
      })

      if (error) {
        Analytics.trackEvent('subscription.lookup.error', {
          message: error.message,
        })
        console.error(error)
        throw error
      }

      return currentSubscription
    },
    [user.subscription?.customerId, user.subscription?.id]
  )

  /**
   * Sync the user's subscription with the latest data from Stripe
   */
  const checkSubscription = useCallback(async (): Promise<void> => {
    if (subscriptionLookupRef.current) {
      return
    }

    subscriptionLookupRef.current = true
    setIsSubscriptionLoading(true)

    try {
      const currentSubscription = await fetchSubscription()

      if (currentSubscription) {
        Analytics.setUserProps({
          [MixpanelUserProps.subscriptionStatus]: currentSubscription.status,
        })

        if (!isEqual(subscription, currentSubscription)) {
          await updateUser({
            subscription: currentSubscription,
          })
        }
      }
    } catch (_) {
      console.error('Unable to fetch subscription & update user')
    }

    setIsSubscriptionLoading(false)
    subscriptionLookupRef.current = false
  }, [fetchSubscription, subscription, updateUser])

  /**
   * Initiate a Stripe checkout session
   * @see https://stripe.com/docs/payments/checkout/one-time
   */
  const initiateSubscribe = useCallback(
    async (
      priceId: string,
      onBeforeRedirect: () => Promise<void>,
      returnUrl?: string,
      coupon?: string
    ): Promise<void> => {
      try {
        // Always look up an existing subscription first
        const subscription = await fetchSubscription()

        let stripeCustomerId = subscription?.customerId

        // Check for an existing checkout session
        if (!stripeCustomerId && user.subscription?.sessionId) {
          const { response: session } = await getStripeCheckoutSession(
            user.subscription.sessionId
          )

          if (session) {
            stripeCustomerId = session.customer as string
          }
        }

        // If no Stripe customer is found, create one for this user
        if (!stripeCustomerId) {
          stripeCustomerId = await createStripeCustomer()
        }

        setIsCheckoutLoading(true)

        const stripe = await getStripe()

        const { response, error } = await createCheckoutSession(
          // We assume it always exists as we are hopefully covering all the cases in UserProvider
          stripeCustomerId as string,
          priceId,
          returnUrl,
          coupon
        )

        if (error) {
          throw error
        }

        if (response) {
          const { sessionId } = response
          await updateUserFields({
            'subscription.status': 'incomplete',
            'subscription.sessionId': sessionId,
          })

          try {
            await onBeforeRedirect()
            const redirectResult = await stripe?.redirectToCheckout({
              sessionId,
            })
            if (redirectResult?.error) {
              throw Error(redirectResult.error.message)
            }
          } catch (error) {
            throw Error(error?.message)
          }
        }
      } catch (e) {
        setIsCheckoutLoading(false)
        toast(
          MakeToast({
            title: 'There was an issue creating a subscription for you',
            description: 'Please try again later',
            status: 'error',
            duration: 5000,
          })
        )
        const errorForSentry = new Error(
          'There was an issue creating a subscription session'
        )
        sentryCaptureException(errorForSentry)
        Analytics.trackEvent('subscription.buy.error', {
          trialDays: kTrialPeriodDaysForNewUsers,
          priceId,
          coupon,
          error: e.message,
        })
      }
    },
    [
      fetchSubscription,
      user.subscription?.sessionId,
      createStripeCustomer,
      updateUserFields,
      toast,
    ]
  )

  /**
   * Creates a link for a user to manage their Stripe account
   * If priceId is present, user will be sent directly to upgrade page for
   * specified price package
   */
  const redirectToCustomerPortal = useCallback(
    async (priceId?: string) => {
      if (subscription?.id == null) {
        return false
      }

      // If the user has no customer id, we refetch the customer and get the id from it
      let stripeCustomerId = user.subscription?.customerId

      if (!stripeCustomerId) {
        const currentSubscription = await fetchSubscription()
        stripeCustomerId = currentSubscription?.customerId
      }

      const { response } = await createPortalLink(
        stripeCustomerId as string,
        subscription.id,
        window.location.pathname
      )

      try {
        let responseUrl = response?.url

        if (responseUrl) {
          if (priceId) {
            // Sends user directly to upgrade page of specified price package
            responseUrl = `${responseUrl}/subscriptions/${subscription.id}/preview/${priceId}`
          }

          window.location.assign(responseUrl)
        }
      } catch (error) {
        console.error(error)
        return false
      }

      return true
    },
    [subscription?.id, user.subscription?.customerId, fetchSubscription]
  )

  /**
   * At this point, the Stripe purchase is already done, and we just
   * need to update our accounting of it internally.
   * @param sessionId The sessionId passed through the URL
   */
  const redeemPurchase = useCallback(
    async (sessionId: string) => {
      // If user doesn't exists return
      if (!user?.id) {
        return
      }

      setIsSubscriptionLoading(true)
      try {
        const currentSubscription = await fetchSubscription(sessionId)

        if (currentSubscription) {
          paymentRedeemedRef.current = true

          // Before: 499 or 4799
          // After: 4.99 or 47.99 (in USD)
          const priceUSD = currentSubscription?.price
            ? currentSubscription?.price / 100
            : 0

          await updateUser({
            subscription: currentSubscription,
          })

          Analytics.trackEvent('subscription.buy.success', {
            trialDays: kTrialPeriodDaysForNewUsers,
            price: priceUSD,
            interval: currentSubscription.interval,
            productName: determineSubscriptionTier(currentSubscription.product),
            source: currentSubscription.upgradeSource,
          })

          Analytics.setUserProps({
            [MixpanelUserProps.subscriptionStatus]: currentSubscription.status,
            [MixpanelUserProps.upgradeSource]:
              currentSubscription.upgradeSource,
          })

          // Set user email for Google Ad Enchanced Conversion Tracking
          // TODO: send this during login & signup actions as well
          ReactGA.gtag('set', 'user_data', {
            email: currentSubscription?.customerEmail,
          })

          Analytics.trackGAConversionEvent(priceUSD, sessionId, {
            interval: currentSubscription.interval,
            trial_days: kTrialPeriodDaysForNewUsers,
          })

          if (!toast.isActive(subscriptionSuccessToastId)) {
            toast(
              MakeToast({
                id: 'subscription-buy-success',
                title: 'Thank you for your purchase!',
                status: 'success',
                duration: 5000,
              })
            )
          }

          // If referral for the user exists treat this as a trial conversion
          await triggerReferralStage(
            ReferralConversionStage.trial,
            user.referredByCode
          )

          // Remove payment id from the URL query
          const { pathname, query } = router
          const updatedQuery = { ...query }
          delete updatedQuery.payment_id
          router.replace({ pathname, query: updatedQuery }, undefined, {
            shallow: true,
          })
        }
      } catch (e) {
        Analytics.trackEvent('subscription.buy.error', { error: e.message })
        setIsSubscriptionLoading(false)
      }

      setIsSubscriptionLoading(false)
    },
    [
      fetchSubscription,
      updateUser,
      toast,
      triggerReferralStage,
      user.referredByCode,
      user?.id,
      router,
    ]
  )

  /**
   * Open upgrade modal and capture source
   */
  const openSubscribeModal = useCallback(
    (source: SubscriptionSource) => {
      Analytics.trackEvent('subscription.upgrade.view', {
        status: subscription?.status,
        source,
        trialDays: kTrialPeriodDaysForNewUsers,
      })
      onUpgradeModalOpen()
      setUpgradeSource(source)
    },
    [onUpgradeModalOpen, subscription?.status]
  )

  const handleCanSubmitUpgradeModal =
    useCallback(async (): Promise<boolean> => {
      // If someone clicks "Update payment method" button on the upgrade modal, redirect them to Stripe.
      if (['past_due', 'unpaid'].includes(String(subscription?.status))) {
        await redirectToCustomerPortal()
        return false
      }

      // We should not create a new checkout for users who already have an active sub
      if (
        !showNewUpgradeModal &&
        ['active', 'trialing'].includes(subscription?.status ?? '')
      ) {
        return false
      }

      return true
    }, [subscription?.status, showNewUpgradeModal, redirectToCustomerPortal])

  /**
   * Handle upgrade modal submit
   */
  const handleUpgradeModalSubmit = useCallback(
    async (
      pricePackage: PricePackage,
      onBeforeRedirect: () => Promise<void>
    ): Promise<void> => {
      // Allow user to upgrade / manage existing active subscription
      if (subscriptionTier && user.subscription?.status !== 'canceled') {
        redirectToCustomerPortal(pricePackage.id)
        return
      }

      let returnUrl = router.asPath
      // If its an anonymous user, redirect them to create an account
      if (!user.email) {
        returnUrl = navigator.signup
      }

      const defaultPriceId = pricePackage.id

      Analytics.trackEvent('subscription.buy', {
        source: upgradeSource,
        trialDays: kTrialPeriodDaysForNewUsers,
        price: pricePackage.price,
        interval: pricePackage.interval,
        productName: pricePackage.tier,
      })

      await initiateSubscribe(defaultPriceId, onBeforeRedirect, returnUrl)
    },
    [
      subscriptionTier,
      router.asPath,
      upgradeSource,
      user.email,
      initiateSubscribe,
      redirectToCustomerPortal,
    ]
  )

  /**
   * Redeem purchase on mount
   */
  useEffect(() => {
    if (stripeSessionId && paymentRedeemedRef.current === false) {
      redeemPurchase(stripeSessionId as string)
    }
  }, [redeemPurchase, stripeSessionId])

  /**
   * Check subscription status on mount
   */
  useEffect(() => {
    if (user) {
      checkSubscription()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const context = useMemo(
    () => ({
      redirectToCustomerPortal,
      createStripeCustomer,
      isSubscriptionLoading,
      isSubscriptionPresent,
      isSubscriptionActive,
      subscriptionTier,
      memoryEnabled,
      hasMemoryFeature,
      showNewUpgradeModal,
      subscriptionTierName,
      openSubscribeModal,
      checkSubscription,
      subscription,
    }),
    [
      redirectToCustomerPortal,
      createStripeCustomer,
      isSubscriptionLoading,
      isSubscriptionPresent,
      isSubscriptionActive,
      subscriptionTier,
      memoryEnabled,
      hasMemoryFeature,
      showNewUpgradeModal,
      subscriptionTierName,
      openSubscribeModal,
      checkSubscription,
      subscription,
    ]
  )

  return (
    <SubscriptionProviderContext.Provider value={context}>
      {children}
      {isUpgradeModalOpen ? (
        showNewUpgradeModal ? (
          <NewUpgradeModal
            subscriptionStatus={subscription?.status}
            isOpen={isUpgradeModalOpen}
            isLoading={isCheckoutLoading}
            onCanSubmit={handleCanSubmitUpgradeModal}
            onSubmit={handleUpgradeModalSubmit}
            onClose={onUpgradeModalClose}
            source={upgradeSource}
            subscriptionTier={subscriptionTier}
          />
        ) : (
          <UpgradeModal
            subscriptionStatus={subscription?.status}
            isOpen={isUpgradeModalOpen}
            isLoading={isCheckoutLoading}
            onCanSubmit={handleCanSubmitUpgradeModal}
            onSubmit={handleUpgradeModalSubmit}
            onClose={onUpgradeModalClose}
            source={upgradeSource}
          />
        )
      ) : null}
    </SubscriptionProviderContext.Provider>
  )
}

/**
 * We only care about some modifications here, specifically to prevent
 * an update loop. (Also to not import unnecessary packages)
 * @param user
 * @param previous
 * @returns
 */
export function isModified(user: User, previous: User) {
  if (!previous.onesignal_id || previous.onesignal_id !== user.onesignal_id) {
    return true
  }

  if (user.timezone !== previous.timezone) {
    return true
  }

  if (user.reminder_hour_utc !== previous.reminder_hour_utc) {
    return true
  }

  return false
}
