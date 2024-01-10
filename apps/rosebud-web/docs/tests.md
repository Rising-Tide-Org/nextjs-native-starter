## Introduction

We use Playwright to write our automated tests. You can find the tests in this [E2E](/e2e) folder and learn more about it by visiting [Playwright Docs](https://playwright.dev/docs/intro). Prior to trying to run your tests validate you have [Chromium installed](https://playwright.dev/docs/browsers#install-browsers). To learn more about our current Playwright Configuration you can find it [here](/playwright.config.ts)

## Playwright fundamentals

Running E2E tests headless

```bash
yarn run e2e:test
```

Running tests headed

```bash
yarn run e2e:test --headed
```

Increase amount of workers on Local Machine to run tests in parallel to speed up test time. Recommended not to Exceed 5 Workers

```bash
# Visit playwright.config.ts file

  // Number of browsers to run in parallel, undefined = fallback to default
  workers: 1,
```

Run E2E tests fast with 5 workers

```bash
yarn run e2e:test:fast
```

To isolate a test you can add `test.only` to the test

```bash
test.only('should navigate to the prompts and entries page', async ({ page }) => {
  await E2EHelpers.bypassOnboarding(page)
  await page.waitForTimeout(1000)
  await page.getByTestId('nav-tab-Explore').click()
  await page.waitForURL('/library', { waitUntil: 'load' })
  await expect(page.getByTestId('prompts-tab-personal')).toContainText(
    'For you'
  )
```

## What to do if you fail CI/CD and you cannot merge to Main?

In order to debug your issue beyond the Github Actions Playwright error log you can update PLAYWRIGHT_TEST_BASE_URL in your .env file. This will allow you to run tests locally on your machine against your Preview Link to get the error codes in your local console and isolate the issue by adding `test.only`. Fix the broken tests and ensure they pass locally. After you can commit back to your branch and the tests should now pass on CD.
`PLAYWRIGHT_TEST_BASE_URL={URL_OF_YOUR_VERCEL_PREVIEW_BRANCH}`

## How to run tests locally

1. Spin up Local host

```bash
yarn dev
```

2. Run emulators

```bash
yarn run emulators
```

3. Validate you have commented out PLAYWRIGHT_TEST_BASE_URL in your .env so it uses the local environment

4. Run tests

```bash
yarn run test:e2e --headed
```
