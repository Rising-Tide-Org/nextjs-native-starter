import { expect, Page, test } from '@playwright/test'
import routes from 'lib/routes'

import globalAPIMock from './util/api-mock'
import { E2EHelpers } from './util/helpers'

test.beforeEach(globalAPIMock)

export const finishOnboarding = async (page: Page) => {
  await expect(page.getByTestId('compose-response-input')).toBeVisible()
  await page
    .getByTestId('compose-response-input')
    .fill(E2EHelpers.entryAnswers[0])

  await expect(page.getByTestId('dot-flashing-animation')).not.toBeVisible()

  // Finish
  await E2EHelpers.finishEntry(page)

  // Promos should be visible
  await E2EHelpers.closeOnboardingModalsAndCreateAccount(page)

  await expect(page).toHaveURL('/home')

  await expect(page.getByTestId('entry-cta')).not.toBeVisible()
  await expect(page.getByTestId('entry-complete-cta')).toBeVisible()

  await page.getByTestId('nav-tab-Entries').click()
  await expect(page).toHaveURL('/journal')

  // normal solution
  const firstItem = page.locator('div[role="group"] > div').first()
  await firstItem.click()
  const entryTab = page.getByTestId('entry-card-entry-tab').first()
  await expect(entryTab).toBeVisible()
  await entryTab.click()

  await expect(page.getByTestId('entry-card-answer-0')).toContainText(
    E2EHelpers.entryAnswers[0]
  )
}

test('happy path', async ({ page }) => {
  await page.goto('/')
  // Confirm onboarding entry CTA is visible and click on it to create an anonymous user
  await page.getByTestId('initiate-onboarding-btn').click()
  await E2EHelpers.completeOnboarding(page)
  await finishOnboarding(page)
})

test('should be able to skip onboarding and submit', async ({ page }) => {
  await page.goto('/')
  await page.waitForTimeout(1000)

  // Confirm onboarding entry CTA is visible and click on it to create an anonymous user
  await page.getByTestId('initiate-onboarding-btn').click()
  await page.waitForURL(`**${routes.onboarding}`, { waitUntil: 'load' })
  await expect(page).toHaveURL(routes.onboarding)
  await expect(page.getByTestId('skip-button')).toBeVisible({ timeout: 100000 })
  await page.getByTestId('skip-button').click()

  // One way or the other we need to get to the compose page
  try {
    await expect(page).toHaveURL('/home')
    await page.goto('/compose/rose-bud-thorn')
  } catch (_) {
    await page.goto('/compose/rose-bud-thorn')
  }

  // Verify that the first prompt is visible
  const firstPromptContent = await page
    .getByTestId('compose-active-prompt-0')
    .textContent()
  await expect(firstPromptContent).toContain('🌹')

  await expect(page.getByTestId('compose-response-input')).toBeVisible()
  await E2EHelpers.completeRoseBudThorn(page)

  await finishOnboarding(page)
})
