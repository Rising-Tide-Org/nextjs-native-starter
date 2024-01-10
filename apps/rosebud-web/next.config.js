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

const withPWA = require('next-pwa')

const securityHeaders = [
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
  // https://infosec.mozilla.org/guidelines/web_security#examples-9
  {
    key: 'Referrer-Policy',
    value: 'no-referrer, strict-origin-when-cross-origin',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
  // TODO we should do it at some point, there would probably be a lot of domains to define
  // TODO remove X-XSS-Protection when adding proper CSP
  // https://infosec.mozilla.org/guidelines/web_security#content-security-policy
  {
    key: 'Content-Security-Policy',
    value:
      // Disabling CSP in dev mode
      // Link: https://rosebudjournal.slack.com/archives/C03S5RK9Z29/p1695681324486889
      // : "default-src https: 'unsafe-inline';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data: https:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline'; worker-src blob: data:; upgrade-insecure-requests",
      '',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection
  // Even tho it is not recommended on MDN to use it, we are using it in place for a good CSP policy
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-DNS-Prefetch-Control
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
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
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/ffmpeg/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, s-maxage=31536000, immutable',
          },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/mp/lib.min.js',
        destination: 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js',
      },
      {
        source: '/mp/lib.js',
        destination: 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.js',
      },
      {
        source: '/mp/decide',
        destination: 'https://decide.mixpanel.com/decide',
      },
      {
        source: '/mp/:slug*',
        destination: 'https://api-js.mixpanel.com/:slug*',
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/entries',
        destination: '/journal',
        permanent: true,
      },
      {
        source: '/explore',
        destination: '/library',
        permanent: true,
      },
    ]
  },
  webpack: (config, { webpack }) => {
    // this will override the experiments
    config.experiments = { ...config.experiments, topLevelAwait: true }

    config.plugins.push(
      new webpack.DefinePlugin({
        // Removes sentry bits we do not need / use https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/tree-shaking/#list-of-flags
        __SENTRY_DEBUG__: false,
        __SENTRY_TRACING__: false,
      })
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
    { hideSourcemaps: true }
  )
)
