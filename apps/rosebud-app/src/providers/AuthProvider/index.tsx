import { firebaseAuth } from 'db'
import type { User as AuthUser } from 'firebase/auth'
import {
  EmailAuthProvider,
  linkWithCredential,
  signInAnonymously,
  sendEmailVerification,
  signOut,
  updateProfile,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth'

// TODO: use this rather than firebase/auth
// import { FirebaseAuthentication } from '@capacitor-firebase/authentication'

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { parseFirebaseError } from 'util/firebase'
import nookies from 'nookies'
import { useRouter } from 'next/router'
import navigator, { unprotectedRoutes } from 'lib/routes'
import { kLSAppPrefix, kLSKeyForSignOut } from 'constants/localStorage'
import { EntryProvider } from 'providers/EntryProvider'
import { GoalsProvider } from 'providers/GoalsProvider'
import { PromptProvider } from 'providers/PromptProvider'
import { SubscriptionProvider } from 'providers/SubscriptionProvider'
import { UserProvider } from 'providers/UserProvider'
import Analytics from 'lib/analytics'
import { ModalProvider } from 'providers/ModalProvider'
import { fetchOne } from 'db/fetch'
import { uuidv4 } from 'util/uuid'
import { createRecord } from 'db/mutate'
import { User, UserFlag } from 'types/User'
import { getNearestUTCHourFromLocal, getTimezone } from 'util/date'
import { kDefaultReminderTime } from 'constants/defaults'
import { captureException as sentryCaptureException } from '@sentry/nextjs'
import { useReferralConversion } from 'hooks/useReferralConversion'
import { ReferralConversionStage } from 'constants/referral'
import { kVersionsWithReleaseNotes } from 'constants/releaseNotes'
import { getNearestLanguage } from 'l10n/languages'
import getUserLocale from 'get-user-locale'
import { serverTimestamp } from 'firebase/firestore'
import { StreakProvider } from 'providers/StreakProvider'
import { getUTMParams } from 'util/window'
import routes from 'lib/routes'
import { getRandomElement } from 'util/array'
import { createProfileKlaviyo } from 'net/klaviyo'
import { NotificationsVariant } from 'constants/notifications'
import { PriceDiscoveryVariant, PriceIntervalVariant } from 'constants/premium'
import PageLoadingReset from 'ui/global/PageLoading/PageLoadingReset'
import { FirebaseError } from 'firebase/app'
import { appendQueryParam } from 'util/url'
import { LifemapProvider } from 'providers/LifemapProvider'
import { Capacitor, CapacitorCookies } from '@capacitor/core'
// import { Capacitor } from '@capacitor/core'

type AuthProviderContextType = {
  user: AuthUser | null | undefined
  refreshToken: () => Promise<string | undefined>
  signOut: () => Promise<void>
  signInAnonymously: () => Promise<AuthUser | undefined>
  signIn: (email: string, password: string) => Promise<AuthUser | undefined>
  signUp: (
    email: string,
    password: string,
    name?: string,
  ) => Promise<AuthUser | undefined>
}

const defaultAuthContext = {
  user: null,
}

export const AuthProviderContext = createContext<AuthProviderContextType>(
  defaultAuthContext as AuthProviderContextType,
)

/**
 * React hook that reads from `AuthProvider` context
 * Returns modal disclosure control for generalized modals
 */
export const useAuthProvider = () => {
  const context = useContext(AuthProviderContext)
  if (context === undefined) {
    throw new Error('useAuthProvider must be used within a AuthProvider')
  }
  return context
}

type Props = {
  children: ReactNode
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<AuthUser | null>()
  const [showReset, setShowReset] = useState(false)
  const router = useRouter()
  const triggerReferralStage = useReferralConversion()
  const authRequired = !unprotectedRoutes.includes(router.route)

  /**
   * Handle timeout
   */
  useEffect(() => {
    const handle = setTimeout(() => {
      if (user === undefined) {
        setShowReset(true)
      }
    }, 5000)
    return () => clearTimeout(handle)
  }, [user])

  /**
   * Setting auth user
   */
  useEffect(() => {
    // FirebaseAuthentication.addListener('authStateChange', ({ user }) => {
    //   setUser(user)
    // })

    // Listen for changes to auth user
    const authUnsub = firebaseAuth.onAuthStateChanged(async user => {
      setUser(user)

      // if viewing a protected page when auth state changes to logged-out,
      // redirect to /signin, with the protected path (including any existing params)
      // included as the `redirectTo` URL param.
      if (!user && authRequired) {
        let params
        const lsKey = `${kLSAppPrefix}/${kLSKeyForSignOut}`

        if (window.localStorage.getItem(lsKey)) {
          // this auth state change came because the user signed out themselves.
          // navigate to /signin without any redirect or other url params.
          window.localStorage.removeItem(lsKey)
          params = ''
        } else {
          // otherwise append ?redirectTo for post login nav.
          params = appendQueryParam('redirectTo', router.asPath)
        }

        router.push(`${navigator.signin}${params}`)
      }
    })

    // write updates to the short-lived ID token to a cookie so it can
    // be used by API routes.
    const authIdUnsub = firebaseAuth.onIdTokenChanged(async user => {
      if (user) {
        const token = await user.getIdToken()

        // TODO: wrap these with a platform agnostic setCookie()
        if (Capacitor.isNativePlatform()) {
          await CapacitorCookies.setCookie({
            key: 'token',
            url: 'http://192.168.0.146:3000',
            value: token,
          })
        }

        nookies.set(undefined, 'token', token, { path: '/' })
      } else {
        // TODO: wrap these with a platform agnostic deleteCookie()
        nookies.destroy(undefined, 'token', { path: '/' })
        nookies.destroy(undefined, 'uuid', { path: '/' })

        if (Capacitor.isNativePlatform()) {
          CapacitorCookies.deleteCookie({
            key: 'token',
            url: 'http://192.168.0.146:3000',
          })
        }
      }
    })

    return () => {
      authUnsub()
      authIdUnsub()
    }
  }, [router.route])

  const handleRefreshToken = async () => {
    const user = firebaseAuth.currentUser

    if (user) {
      let token: string | undefined

      try {
        token = await user.getIdToken()
        // const nativeToken = await FirebaseAuthentication.getIdToken()
        // token = nativeToken.token

        nookies.set(undefined, 'token', token, { path: '/' })
      } catch (error) {
        console.error('[Error refreshing token] \n', error)
        Analytics.trackEvent('auth.refreshToken.error', {
          error: error.message,
        })
      }

      return token
    }
  }

  /**
   * Refresh id token every 10 minutes
   * We need to do this because Firebase tokens expire after 1 hour
   */
  useEffect(() => {
    const handle = setInterval(async () => {
      await handleRefreshToken()
    }, 10 * 60 * 1000)
    return () => clearInterval(handle)
  }, [handleRefreshToken])

  /**
   * Create Firestore user
   * @param user Firebase Auth user
   */
  const createFirestoreUser = useCallback(
    async (user: AuthUser) => {
      await createUserDoc(user)
      console.debug('[USER] Created')

      // Record referralCode to a user profile if exists
      triggerReferralStage(ReferralConversionStage.initial)
    },
    [triggerReferralStage],
  )

  /**
   * Handle anonymous sign in
   * @see https://firebase.google.com/docs/auth/web/anonymous-auth
   */
  const handleSignInAnonymously = useCallback(async () => {
    if (user?.uid) {
      // Do nothing if user is already signed in
      return user
    }

    try {
      const userCredential = await signInAnonymously(firebaseAuth)

      // After sign in anonymously, we want to create a base user account in Firestore
      await createFirestoreUser(userCredential.user)

      return userCredential.user
    } catch (error) {
      const errorCode = error.code
      const errorMessage = error.message

      console.error(errorMessage, errorCode)

      throw parseFirebaseError(error)
    }
  }, [createFirestoreUser, user])

  /**
   * Handle sign out
   */
  const handleSignOut = useCallback(async () => {
    Analytics.trackEvent('auth.signOut')

    // Clear local storage
    const keys = Object.keys(window.localStorage).filter(k =>
      k.startsWith(kLSAppPrefix),
    )
    keys.forEach(k => {
      window.localStorage.removeItem(k)
    })

    // set a temp LS flag to prevent ?redirectTo from being appended
    // to /signin page when the user has taken action to sign out.
    // see onAuthStateChanged.
    window.localStorage.setItem(`${kLSAppPrefix}/${kLSKeyForSignOut}`, 'true')

    await signOut(firebaseAuth)
  }, [router])

  /**
   * Handle sign up
   * @see https://firebase.google.com/docs/auth/web/password-auth
   */
  const handleSignUp = useCallback(
    async (email: string, password: string, name?: string) => {
      try {
        let newUser: AuthUser | undefined

        if (user?.isAnonymous) {
          const credential = EmailAuthProvider.credential(email, password)
          const linkResult = await linkWithCredential(user, credential)

          // After linking, we need to sign in with the new user
          // Otherwise, Firebase seems to think the id token has been revoked
          if (linkResult.user) {
            const signInResult = await signInWithEmailAndPassword(
              firebaseAuth,
              email,
              password,
            )
            newUser = signInResult.user
          } else {
            throw new Error('Could not link anonymous account')
          }
        } else {
          // sign up with email and password
          const userCredential = await createUserWithEmailAndPassword(
            firebaseAuth,
            email,
            password,
          )
          newUser = userCredential.user
          await createFirestoreUser(newUser)
        }

        await updateProfile(newUser, {
          displayName: name,
        })

        await sendEmailVerification(newUser, {
          url: `${window.location.origin}${routes.signin}?returnTo=${window.location.pathname}`,
        })

        // Create contact in email automation system
        const existingUser = await fetchOne<User>('users', newUser.uid, {
          noCache: true,
        })
        if (existingUser) {
          createProfileKlaviyo(email)
        }

        return newUser
      } catch (error) {
        const errorCode = error.code
        const errorMessage = error.message
        console.error(errorMessage, errorCode)
        throw parseFirebaseError(error)
      }
    },
    [createFirestoreUser, user],
  )

  /**
   * Handle sign in
   */
  const handleSignIn = useCallback(async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        firebaseAuth,
        email,
        password,
      )
      return userCredential.user
    } catch (error) {
      const errorCode = error.code
      const errorMessage = error.message
      console.error(errorMessage, errorCode)
      throw parseFirebaseError(error)
    }
  }, [])

  const context = useMemo(
    () => ({
      user,
      refreshToken: handleRefreshToken,
      signInAnonymously: handleSignInAnonymously,
      signIn: handleSignIn,
      signUp: handleSignUp,
      signOut: handleSignOut,
    }),
    [
      user,
      handleSignIn,
      handleSignUp,
      handleSignOut,
      handleSignInAnonymously,
      handleRefreshToken,
    ],
  )

  // attempting to access a protected page while the auth state is loading or no auth is present.
  // in the latter case, the redirect to /signin will soon kick in.
  if (!user && authRequired) {
    return (
      <PageLoadingReset
        showReset={showReset}
        source="AuthProvider"
        signOut={handleSignOut}
      />
    )
  }

  return (
    <AuthProviderContext.Provider value={context}>
      {user ? (
        <UserProvider authUser={user} signOut={handleSignOut}>
          <SubscriptionProvider>
            <GoalsProvider>
              <EntryProvider>
                <LifemapProvider>
                  <StreakProvider>
                    <PromptProvider>
                      <ModalProvider>{children}</ModalProvider>
                    </PromptProvider>
                  </StreakProvider>
                </LifemapProvider>
              </EntryProvider>
            </GoalsProvider>
          </SubscriptionProvider>
        </UserProvider>
      ) : (
        children
      )}
    </AuthProviderContext.Provider>
  )
}

const createUserDoc = async (authUser: AuthUser) => {
  try {
    // Double check that the user doesn't exist
    const existingUser = await fetchOne<User>('users', authUser.uid, {
      noCache: true,
    })
    if (existingUser) {
      Analytics.trackEvent('auth.user.exists', {
        userId: authUser?.uid,
      })
      return existingUser
    }

    // If the user doesn't exist, create it
    const uuid = uuidv4()
    const locale = getNearestLanguage(getUserLocale()).code
    const createdRecord = createRecord<User>(
      'users',
      {
        id: authUser?.uid,
        phoneVerified: false,
        uuid,
        timezone: getTimezone(),
        reminder_hour_local: kDefaultReminderTime,
        reminder_hour_utc: getNearestUTCHourFromLocal(kDefaultReminderTime),
        variants: {
          // Test new onboarding, 50/50 split
          onboarding: getRandomElement(['onboarding-v6', 'onboarding-v5']),
          notifications: getRandomElement([
            NotificationsVariant.generic,
            NotificationsVariant.personalized,
          ]),
          pricing: PriceDiscoveryVariant.withDiscount,
          pricingInterval: getRandomElement(
            Object.values(PriceIntervalVariant),
          ),
        },
        metadata: {
          // Prevent new user from seeing the release notes for the current version
          lastSeenReleaseNotes: kVersionsWithReleaseNotes[0],
          // New users will always have their entries vectorized and indexed
          backfilledVectors: true,
          // Store the UTM params from the URL into the user's metadata
          ...getUTMParams(),
        },
        flags: {
          // Only existing users should see these things
          [UserFlag.newJournalModalDismissed]: true,
        },
        settings: {
          journalMode: 'interactive',
          locale,
          memoryEnabled: true,
        },
        createdAt: serverTimestamp(),
      },
      authUser.uid,
    )
    return createdRecord
  } catch (e) {
    sentryCaptureException(e)
    const firebaseError = e as FirebaseError
    Analytics.trackEvent('auth.createUser.error', {
      userId: authUser?.uid,
      error: firebaseError.message,
      code: firebaseError.code,
    })
  }
}
