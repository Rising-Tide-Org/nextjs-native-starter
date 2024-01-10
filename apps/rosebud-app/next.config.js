/* eslint-disable @typescript-eslint/no-var-requires */
// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
const { withSentryConfig } = require('@sentry/nextjs')
const { version } = require('./package.json')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

// TODO: won't need this anymore here in rosebud-app
const withPWA = require('next-pwa')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  transpilePackages: ['ui, lib'],
  images: {
    unoptimized: true,
  },

  reactStrictMode: true,
  env: {
    APP_ENV: process.env.APP_ENV,
    APP_VERSION: version,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    MIXPANEL_TOKEN: process.env.MIXPANEL_TOKEN,
    GA_TRACKING_ID: process.env.GA_TRACKING_ID,
    ONE_SIGNAL_APP_ID: process.env.ONE_SIGNAL_APP_ID,
    ONE_SIGNAL_API_KEY: process.env.ONE_SIGNAL_API_KEY,
    SLACK_CANCELLATION_WEBHOOK_URL: process.env.SLACK_CANCELLATION_WEBHOOK_URL,
  },
  webpack: (config, { webpack }) => {
    // this will override the experiments
    config.experiments = { ...config.experiments, topLevelAwait: true }

    config.plugins.push(
      new webpack.DefinePlugin({
        // Removes sentry bits we do not need / use https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/tree-shaking/#list-of-flags
        __SENTRY_DEBUG__: false,
        __SENTRY_TRACING__: false,
      }),
    )

    // Add a rule to handle .md files
    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader',
    })

    // return the modified config
    return config
  },
  sentry: {
    // Suppresses a warning, more info: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup
    hideSourceMaps: process.env.NEXT_PUBLIC_VERCEL_ENV === 'production',
  },
}

// Find options here:
// https://github.com/shadowwalker/next-pwa
const pwaConfig = {
  dest: 'public', // Where the service worker files go.
  register: false, // Whether to register a service worker. This should be false if we use OneSignal for notifs.
  skipWaiting: true, // Unsure
  // disable: process.env.NODE_ENV === 'development', // Whether to disable the PWA plugin.
  dynamicStartUrl: false, // default: false, if your start url returns different HTML document under different state,
  reloadOnOnline: true, // Whether to reload if user goes from offline to online.
}

module.exports = withBundleAnalyzer(
  withSentryConfig(
    // Do not activate workbox for dev
    process.env.NODE_ENV === 'development' ||
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'development'
      ? nextConfig
      : withPWA(pwaConfig)(nextConfig),
    { silent: true },
    { hideSourcemaps: true },
  ),
)
