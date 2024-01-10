import { test, expect } from '@playwright/test'
import globalAPIMock from './util/api-mock'
import { E2EHelpers } from './util/helpers'

test.beforeEach(globalAPIMock)

// TODO: Figure out how to fake dates to test UI State
// const fakeSunday = new Date("April 9 2023 13:37:11").valueOf();
// const fakeMidnight = new Date("March 14 2042 00:00:00").valueOf();

test('should see onboarding', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByText('Welcome to Rosebud')).toBeVisible()
  await expect(page.getByTestId('initiate-onboarding-btn')).toBeVisible()

  // Confirm onboarding entry CTA is visible and click on it
  await page.getByTestId('initiate-onboarding-btn').click()

  // Confirm that onboarding redirects us to the onboarding page
  await expect(page).toHaveURL(/\/onboarding.*/, { timeout: 30000 })
})

test('should navigate to the prompts and entries page', async ({ page }) => {
  await E2EHelpers.bypassOnboarding(page)
  await page.waitForTimeout(1000)
  await page.getByTestId('nav-tab-Explore').click()
  await page.waitForURL('/library', { waitUntil: 'load' })
  await expect(page.getByTestId('prompts-tab-personal')).toContainText(
    'For you'
  )

  await page.getByTestId('nav-tab-Entries').click()
  await page.waitForURL('/journal', { waitUntil: 'load' })
  // Onboarding v6 impacts this line below but could comeback
  // await expect(page.getByText('Your entries will show up here')).toBeVisible()
  await expect(page.getByText('This week')).toBeVisible()
})

test('should be able to see settings', async ({ page, isMobile }) => {
  await E2EHelpers.bypassOnboarding(page)

  // Check subscription
  await page.getByTestId('settings-menu-icon').click()
  await page.getByTestId('settings-menu-item-subscriptions').click()
  await page.waitForTimeout(1000)

  await expect(
    page.getByRole('heading', { name: 'Grow without limits' })
  ).toBeVisible()

  await page.getByTestId('upgrade-promo-close').click()

  // Varies for onboarding v5 & v6
  const closeButton = await page.getByTestId('install-app-modal-close')
  await page.waitForTimeout(1000)
  if (await closeButton.isVisible()) {
    await closeButton.click()
  }

  // Check settings
  await page.waitForTimeout(1000)
  await page.getByTestId('settings-menu-icon').click()

  if (isMobile) {
    await page.getByTestId('nav-tab-Settings').click()
  } else {
    await page.getByTestId('settings-menu-item-settings').click()
  }

  await expect(page.getByRole('heading', { name: 'Cloud sync' })).toBeVisible()

  await page.goto('/')

  // Check feedback
  await page.getByTestId('settings-menu-icon').click()
  await page.getByTestId('settings-menu-item-feedback').click()

  await page.waitForTimeout(1000)
  await expect(
    page.getByRole('button', { name: 'Send feedback' })
  ).toBeVisible()

  await page.getByTestId('feedback-modal-close-btn').click()

  // Check referrals
  await page.getByTestId('settings-menu-icon').click()
  await page.getByTestId('settings-menu-item-referrals').click()

  await expect(page.getByRole('button', { name: 'Share' })).toBeVisible()

  // Check help
  const anchorElement = await page.$('a:has-text("Help")')
  await expect(anchorElement?.isVisible()).toBeTruthy()
  const link = await anchorElement?.getAttribute('href')
  await expect(link).toContain('https://help.rosebud.app')
})

// Be aware new onboarding v6 causes two entries to be created in this test
test('should be able to create daily entry', async ({ page }, testInfo) => {
  const withStreak = await E2EHelpers.bypassOnboarding(page)
  // If not redirecting try again
  const now = new Date()
  const templateId =
    now.getHours() < 12 && now.getHours() > 4
      ? 'morning-intention'
      : 'rose-bud-thorn'
  try {
    await page.goto(`/compose/${templateId}`)
    await page.waitForURL(`/compose/${templateId}`)
  } catch (_) {
    await page.goto(`/compose/${templateId}`)
  }

  await E2EHelpers.completeRoseBudThorn(page)

  await page.waitForTimeout(1000)

  await expect(page.getByTestId('compose-response-input')).toBeVisible()
  await page
    .getByTestId('compose-response-input')
    .fill(E2EHelpers.entryAnswers[0])

  await E2EHelpers.finishEntry(page, withStreak)
  await page.waitForTimeout(500)
  if (withStreak) {
    await E2EHelpers.closeOnboardingModals(page)
  }

  await expect(page).toHaveURL('/home')
  await expect(page.getByTestId('entry-cta')).not.toBeVisible()
  await expect(page.getByTestId('entry-complete-cta')).toBeVisible()
  await page.getByTestId('nav-tab-Entries').click()
  await expect(page).toHaveURL('/journal')

  // Mobile and Desktop have different behaviors so viewportSize is checked this matches Playwright Config
  // desktop there should be one entry-card present
  if (testInfo.project.name === 'Desktop Chrome') {
    await expect(page.getByTestId('entry-card')).toHaveCount(1)
  }

  const firstItem = page.locator('div[role="group"] > div').first()
  await firstItem.click()

  // Mobile once you click into an entry you can see only one entry-card
  if (testInfo.project.name === 'Mobile Safari') {
    await expect(page.getByTestId('entry-card')).toHaveCount(1)
  }

  const entryTab = page.getByTestId('entry-card-entry-tab').first()
  await expect(entryTab).toBeVisible()
  await entryTab.click()

  await expect(page.getByTestId('entry-card-answer-0')).toContainText(
    E2EHelpers.entryAnswers[0]
  )
})
