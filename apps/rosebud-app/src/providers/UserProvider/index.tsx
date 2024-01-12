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
import { User, UserFlag } from 'types/User'
import { daysSinceTimestamp } from 'util/date'
import { migrateUserIfNeeded } from 'util/user'
import useFetchOne from 'shared/hooks/useFetchOne'
import { User as AuthUser } from 'firebase/auth'
import PageLoading from 'ui/global/PageLoading'
import { updateRecord } from 'db/mutate'
import Analytics from 'lib/analytics'
import nookies from 'nookies'
import { isPWAInstalled } from 'util/device'
import { setUser } from '@sentry/nextjs'
import { FirebaseError } from 'firebase/app'
import PageLoadingReset from 'ui/global/PageLoading/PageLoadingReset'
import { captureException as sentryCaptureException } from '@sentry/nextjs'
import { checkMigrations } from 'net/firestore'

type UserProviderContextType = {
  user: User
  updateUser: (user: Partial<User>) => Promise<void>
  updateUserFields: (fieldPaths: { [key: string]: any }) => Promise<void>
  setUserFlag: (flag: UserFlag, value: boolean) => Promise<void>
  setUserVariant: (variant: string, value: boolean | string) => Promise<void>
}

const defaultUserContext: { user: User } = {
  user: {
    settings: {
      journalMode: 'focused',
    },
  },
}

export const UserProviderContext = createContext<UserProviderContextType>(
  defaultUserContext as UserProviderContextType
)

/**
 * React hook that reads from `UserProvider` context
 * Returns modal disclosure control for generalized modals
 */
export const useUserProvider = () => {
  const context = useContext(UserProviderContext)
  if (context === undefined) {
    throw new Error('useUserProvider must be used within a UserProvider')
  }
  return context
}

type Props = {
  children: ReactNode
  authUser: AuthUser
  signOut: () => Promise<void>
}

/**
 * Provider that wraps the entire app and provides the user context
 * This is the only place where we should be fetching the user
 * We will also use this provider to migrate the user, if necessary
 * If there is no user, we create one
 */
export const UserProvider = ({ children, authUser, signOut }: Props) => {
  const [showReset, setShowReset] = useState(false)
  const {
    data: user,
    loading,
    error,
  } = useFetchOne<User>('users', authUser.uid, {
    subscribe: true,
    noCache: true,
  })

  /**
   * Handle timeout
   */
  useEffect(() => {
    const handle = setTimeout(() => {
      if (user === null) {
        setShowReset(true)
      }
    }, 5000)
    return () => clearTimeout(handle)
  }, [user])

  /**
   * Capture any errors that occur while fetching the user
   */
  useEffect(() => {
    if (error) {
      const firebaseError = error as FirebaseError
      Analytics.trackEvent('auth.user.error', {
        userId: authUser?.uid,
        error: firebaseError.message,
        code: firebaseError.code,
      })
      sentryCaptureException(error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error])

  /**
   * We will use this effect to create the user, if necessary.
   */
  useEffect(() => {
    if (user && !loading) {
      if (user.uuid) {
        // Identify the user on Mixpanel
        Analytics.identify(user.uuid)

        // Identify the user on Sentry
        setUser({ id: user.uuid, email: user.email })
      }

      Analytics.setUserPropsFromUser(user)
      Analytics.setSuperProps({
        userSettings: user.settings,
        isPWA: isPWAInstalled(),
        'Subscription Status': user.subscription?.status,
        'Days Old': user.createdAt
          ? daysSinceTimestamp(user.createdAt)
          : undefined,
      })

      nookies.set(undefined, 'uuid', user.uuid ?? '', { path: '/' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading])

  if (!user || loading) {
    return (
      <PageLoadingReset
        showReset={showReset}
        source='UserProvider'
        reason={`${user === null ? 'no user doc' : 'loading'} / ${
          authUser?.uid
        }`}
        signOut={signOut}
      />
    )
  }

  return (
    <ActualUserProvider user={user} authUser={authUser}>
      {children}
    </ActualUserProvider>
  )
}

const ActualUserProvider = ({
  children,
  user,
  authUser,
}: {
  children: ReactNode
  user: User | null
  authUser?: AuthUser
}) => {
  const userIdRef = useRef<string>()

  /**
   * Wrapper around updateUser to pass to context
   */
  const updateUser = useCallback(
    async (updatedUser: Partial<User>) => {
      if (user?.id) {
        try {
          return await updateRecord<User>('users', user.id, updatedUser)
        } catch (e) {
          console.error('updateUser failed with', e)
          sentryCaptureException(new Error(`updateUser failed with ${e}`))
          return
        }
      }
      return Promise.reject('User has no id')
    },
    [user?.id]
  )

  /**
   * Preferred method to update user fields
   * @param fieldPaths - object of field paths to update (e.g. { 'metadata.lastSeenReleaseNotes': '1.0.0' })
   */
  const updateUserFields = useCallback(
    async (fieldPaths: { [key: string]: any }) => {
      if (user?.id) {
        try {
          return await updateRecord<User>('users', user.id, {}, fieldPaths)
        } catch (e) {
          console.error('updateUserFields failed with', e)
          sentryCaptureException(new Error(`updateUserFields failed with ${e}`))
          return
        }
      }
      return Promise.reject('User has no id')
    },
    [user?.id]
  )

  /**
   * Set a flag on the user
   */
  const setUserFlag = useCallback(
    async (flag: UserFlag, value: boolean) => {
      if (!user?.id) {
        return
      }
      const flags = user?.flags || {}
      await updateUser({
        flags: { ...flags, [flag]: value },
      })
    },
    [updateUser, user?.flags, user?.id]
  )

  /**
   * Set a variant on the user
   */
  const setUserVariant = useCallback(
    async (variant: string, value: boolean | string) => {
      if (!user?.id) {
        return
      }
      const variants = user?.variants || {}
      await updateUser({
        variants: { ...variants, [variant]: value },
      })
    },
    [updateUser, user?.variants, user?.id]
  )

  /**
   * Update the user's email when necessary
   */
  useEffect(() => {
    if (authUser?.email && user?.id && authUser.email !== user?.email) {
      updateUser({ email: authUser.email })
    }
  }, [authUser?.email, updateUser, user?.email, user?.id])

  /**
   * We will use this effect to migrate the user, if necessary.
   */
  useEffect(() => {
    const changedUser: User | null = migrateUserIfNeeded(user)
    if (changedUser) {
      updateUser(changedUser).then(() => {
        console.debug('[USER] Updated')
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  /**
   * Ask server to check migration state, server will migrate if needed
   */
  useEffect(() => {
    if (userIdRef.current !== user?.id) {
      userIdRef.current = user?.id
      checkMigrations()
    }
  }, [user?.id])

  const context = useMemo(
    () => ({
      user: user || defaultUserContext.user,
      updateUser,
      updateUserFields,
      setUserFlag,
      setUserVariant,
    }),
    [user, updateUser, updateUserFields, setUserFlag, setUserVariant]
  )

  if (!user) {
    return <PageLoading />
  }

  return (
    <UserProviderContext.Provider value={context}>
      {children}
    </UserProviderContext.Provider>
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
