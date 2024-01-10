import { test } from '@playwright/test'
import globalAPIMock from './util/api-mock'

test.beforeEach(globalAPIMock)

// const uploadMockData = async (page: Page, url: string) => {
//   await page.goto('/home')

//   await page.getByTestId('settings-menu-icon').click()
//   await page.getByTestId('settings-menu-item-settings').click()

//   await expect(page.getByRole('heading', { name: 'My Data' })).toBeVisible()

//   const fileChooserPromise = page.waitForEvent('filechooser')
//   await page.getByTestId('import-from-file-btn').click()

//   const fileChooser = await fileChooserPromise
//   await fileChooser.setFiles(url)

//   await page.waitForLoadState('domcontentloaded')

//   await page.waitForTimeout(1000)

//   await expect(page).toHaveURL('/home')
// }

// const simulateInActiveSubscription = async (page: Page) => {
//   await uploadMockData(
//     page,
//     'e2e/upload/inactive-subscription-no-prompts-anxiety.json'
//   )
// }

// const simulateActiveSubscription = async (page: Page) => {
//   await uploadMockData(
//     page,
//     'e2e/upload/active-subscription-no-prompts-anxiety.json'
//   )
// }
