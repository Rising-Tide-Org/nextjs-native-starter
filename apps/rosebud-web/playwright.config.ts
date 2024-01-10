import { PlaywrightTestConfig, devices, defineConfig } from '@playwright/test'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '.env') })

// Use process.env.PORT by default and fallback to port 3000
const PORT = process.env.PORT || 3000

// Set webServer.url and use.baseURL with the location of the WebServer respecting the correct set port
const baseURL =
  process.env.PLAYWRIGHT_TEST_BASE_URL || `http://localhost:${PORT}`

// Reference: https://playwright.dev/docs/test-configuration
const config: PlaywrightTestConfig = {
  // Timeout per test
  timeout: 75 * 1000,
  // Test directory
  testDir: path.join(__dirname, 'e2e'),
  // If a test fails, retry it once
  retries: 1,
  // Artifacts folder where screenshots, videos, and traces are stored.
  outputDir: 'test-results/',

  // Number of browsers to run in parallel, undefined = fallback to default
  workers: 1,

  // Run your local dev server before starting the tests:
  // https://playwright.dev/docs/test-advanced#launching-a-development-web-server-during-the-tests
  webServer: {
    command: 'yarn dev',
    url: baseURL,
    timeout: 120 * 1000,
    reuseExistingServer: true,
  },

  use: {
    // Whether to allow sites to register Service workers.
    // Because of https://github.com/microsoft/playwright/issues/15684#issuecomment-1371127580
    serviceWorkers: 'allow',

    // Use baseURL so to make navigations relative.
    // More information: https://playwright.dev/docs/api/class-testoptions#test-options-base-url
    baseURL,

    // Retry a test if its failing with enabled tracing. This allows you to analyse the DOM, console logs, network traffic etc.
    // More information: https://playwright.dev/docs/trace-viewer
    trace: 'on-first-retry',

    // All available context options: https://playwright.dev/docs/api/class-browser#browser-new-context
    contextOptions: {
      ignoreHTTPSErrors: true,
    },
  },

  projects: [
    {
      name: 'Desktop Chrome',
      use: devices['Desktop Chrome'],
    },
    {
      name: 'Mobile Safari',
      use: devices['iPhone 14 Pro Max'],
    },
  ],
}
export default defineConfig(config)
