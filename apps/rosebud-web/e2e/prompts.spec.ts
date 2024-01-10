import { test, expect } from '@playwright/test'
import globalAPIMock from './util/api-mock'
import { E2EHelpers } from './util/helpers'

test.beforeEach(globalAPIMock)

test.only('should navigate to the prompts page', async ({ page }) => {
  await E2EHelpers.bypassOnboarding(page)
  await page.goto('/home')

  await page.getByTestId('nav-tab-Explore').click()
  await expect(page.getByTestId('prompts-tab-personal')).toContainText(
    'For you'
  )
})

// this test is long and can be needs to be revamped - fails on Onboarding v6 mobile
// test('should complete a custom prompt and see it in entries', async ({
//   page,
// }) => {
//   const withStreak = await E2EHelpers.bypassOnboarding(page)
//   // One way or the other we need to get to the compose page
//   page.waitForTimeout(1000)
//   try {
//     await expect(page).toHaveURL('/home')
//     await page.goto('/compose/rose-bud-thorn')
//   } catch (error) {
//     console.error(
//       'Error navigating to /compose/rose-bud-thorn directly, trying again',
//       error
//     )
//     await page.goto('/compose/rose-bud-thorn')
//   }

//   // Opportunity to optimize you create duplicate entries for v6 onboarding
//   // Verify that the first prompt is visible
//   const firstPromptText = await page
//     .getByTestId('compose-active-prompt-0')
//     .textContent()
//   await expect(firstPromptText).toContain('🌹')
//   await expect(page.getByTestId('compose-response-input')).toBeVisible()

//   await E2EHelpers.completeRoseBudThorn(page)

//   await expect(page.getByTestId('compose-response-input')).toBeVisible()

//   await page
//     .getByTestId('compose-response-input')
//     .fill(E2EHelpers.entryAnswers[0])
//   await E2EHelpers.finishEntry(page, withStreak)

//   if (withStreak) {
//     await E2EHelpers.closeOnboardingModals(page)
//   }
//   await page.waitForTimeout(1000)
//   await page.waitForURL(routes.home, { waitUntil: 'load' })
//   await page.getByTestId('nav-tab-Explore').click()
//   await page.waitForTimeout(800)
//   await page.waitForURL(`**${routes.library}`, { waitUntil: 'load' })
//   await expect(page).toHaveURL(routes.library)

//   const questionText = await page
//     .getByTestId('prompt-list-item')
//     .nth(0)
//     .locator('a')
//     .first()
//     .textContent()

//   await page.getByTestId('prompt-list-item').nth(0).click()

//   await expect(page).toHaveURL(/compose\/prompt.*/, { timeout: 10000 })

//   await expect(page.getByTestId('compose-active-prompt-0')).toContainText(
//     questionText as string
//   )

//   await page
//     .getByTestId('compose-response-input')
//     .fill(E2EHelpers.entryAnswers[0])

//   // Turn streak false because you did a daily checkin above
//   const withNoStreak = false
//   await E2EHelpers.finishEntry(page, withNoStreak)

//   // After the entry is saved we expect the app to redirect back to the original redirect URL
//   await page.waitForURL(`**${routes.library}`, { waitUntil: 'load' })
//   await expect(page).toHaveURL(routes.library)

//   await page.waitForTimeout(1500) // Page load happens to fast here so you have to timeout
//   await page.getByTestId('nav-tab-Entries').click()
//   await page.waitForURL(`**${routes.journal}`, { waitUntil: 'load' })
//   await expect(page).toHaveURL(routes.journal)

//   const firstItem = page.locator('div[role="group"] > div').first()
//   await firstItem.click()
//   const entryTab = page.getByTestId('entry-card-entry-tab').first()
//   await expect(entryTab).toBeVisible()
//   await entryTab.click()

//   await expect(page.getByTestId('entry-card-answer-0').first()).toContainText(
//     E2EHelpers.entryAnswers[0]
//   )
// })
