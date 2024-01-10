// Set Firestore url to local emulator if running locally
export const firestoreUrl = process.env.NEXT_PUBLIC_EMULATOR
  ? 'http://127.0.0.1:8080'
  : 'https://firestore.googleapis.com'

// By default Firebase sets the firestore database name to '(default)'
export const kDatabaseName = '(default)'

// The Firebase project name
export const kProjectName = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

/**
 * The Firebase configuration for the app.
 */
export const firebaseConfig = {
  client: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  },
  server: {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
  },
}

/**
 * The collection paths for the app.
 */
export const kCollectionPathMap = {
  analysis: 'users/{userId}/analysis',
  cancellations: 'users/{userId}/cancellations',
  drafts: 'users/{userId}/drafts',
  entries: 'users/{userId}/entries',
  goals: 'users/{userId}/goals',
  items: 'users/{userId}/items',
  limits: 'users/{userId}/limits',
  personalizations: 'users/{userId}/personalizations',
  prompts: 'users/{userId}/prompts',
  referrals: 'users/{userId}/referrals',
  streaks: 'users/{userId}/streaks',
  summaries: 'users/{userId}/summaries',
  stats: 'users/{userId}/stats',
  migrations: 'users/{userId}/migrations',
  users: 'users',
  lifemap: 'users/{userId}/lifemap',
} as const
