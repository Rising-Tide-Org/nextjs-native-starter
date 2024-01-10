// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { init } from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

init({
  dsn:
    SENTRY_DSN ||
    'https://1ba015a5907d42c9b561cab8bdaddeaf@o338942.ingest.sentry.io/4504806385451008',
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,
  // ...
  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
  enabled: process.env.NODE_ENV === 'production',
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
})
