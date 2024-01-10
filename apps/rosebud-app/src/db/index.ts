import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  connectAuthEmulator,
  indexedDBLocalPersistence,
  initializeAuth,
  inMemoryPersistence,
} from 'firebase/auth'
import {
  connectFirestoreEmulator,
  FirestoreSettings,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'
import { firebaseConfig } from 'constants/firebase'

// make sure we're not using IndexedDB when SSR
// as it is only supported on browser environments
const authPersistence =
  typeof window !== 'undefined'
    ? indexedDBLocalPersistence
    : inMemoryPersistence

const dataPersistence: FirestoreSettings =
  typeof window !== 'undefined'
    ? {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
        ignoreUndefinedProperties: true,
      }
    : {}

export const firebaseApp = !getApps().length
  ? initializeApp(firebaseConfig.client)
  : getApp()
const firestore = initializeFirestore(firebaseApp, dataPersistence)
const firebaseAuth = initializeAuth(firebaseApp, {
  persistence: authPersistence,
})

const shouldConnectEmulators = process.env.NEXT_PUBLIC_EMULATOR === 'true'
if (shouldConnectEmulators) {
  connectAuthEmulator(firebaseAuth, 'http://localhost:9099')

  // Prevents firebase complaining about settings being changed on hot refresh
  if (!(firestore as any)._settingsFrozen) {
    connectFirestoreEmulator(firestore, 'localhost', 8080)
  }
}

export { firebaseAuth, firestore }
