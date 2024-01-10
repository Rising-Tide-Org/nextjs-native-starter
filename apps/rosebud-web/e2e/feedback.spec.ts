// import { test, expect } from '@playwright/test'
// import globalAPIMock from './util/api-mock'
// import { E2EHelpers } from './util/helpers'

// test.beforeEach(globalAPIMock)

// // test.only('validate feedback flow and visually compare', async ({ page }) => {
// //   await E2EHelpers.bypassOnboarding(page)
// //   await page.goto('/home')
// //   await page.waitForTimeout(1000)

// //   await page.getByTestId('settings-menu-icon').click()
// //   await page.waitForTimeout(1000)

// //   await page.getByTestId('settings-menu-item-feedback').click()
// //   await page.waitForTimeout(1000)

// //   expect(page).toHaveScreenshot({ fullPage: true })

// //   await page.waitForTimeout(3000)
// //   await expect(
// //     page.getByRole('button', { name: 'Send feedback' })
// //   ).toBeVisible()

// //   await page.getByTestId('feedback-modal-close-btn').click()
// // })
