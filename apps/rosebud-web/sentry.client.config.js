// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'
import Analytics from './src/lib/analytics'

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

const replay = new Sentry.Replay({
  blockAllMedia: true,
})

// This can be production, preview or development
const enviroment = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.APP_ENV

Sentry.init({
  dsn:
    SENTRY_DSN ||
    'https://1ba015a5907d42c9b561cab8bdaddeaf@o338942.ingest.sentry.io/4504806385451008',
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: enviroment === 'development',

  // The sample rate for sessions that has had an error occur. 1.0 will record all sessions and 0 will record none.
  // This is separate from replaysSessionSampleRate which is also necessary.
  replaysOnErrorSampleRate: 1.0,

  // The sample rate for session-long replays. 1.0 will record all sessions and 0 will record none.
  // We only want to record sessions in production and even then we only want to record 10% of them.
  replaysSessionSampleRate: enviroment === 'production' ? 0.1 : 0,

  beforeSend() {
    const replayId = replay.getReplayId()
    if (replayId) {
      Analytics.trackEvent('sentryReplay.session', {
        sessionUrl: `https://curiotools.sentry.io/replays/${replayId}`,
      })
    }
  },

  integrations: [replay],
  enabled: enviroment !== 'development',
  environment: enviroment,
})
