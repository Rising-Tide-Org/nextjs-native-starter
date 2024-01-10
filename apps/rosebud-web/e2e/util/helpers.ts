import { Page, expect } from '@playwright/test'
import onboardingTemplateV5 from 'templates/onboarding-v5'
import onboardingTemplateV6 from 'templates/onboarding-v6'

export namespace E2EHelpers {
  export const entryAnswers = [
    'I am feeling great today. Delightful day. Finished an engrossing book, enjoyed a vibrant sunset. Work progress steady, relationships flourishing. Grateful for these simple pleasures that make life worth living.',
    'I was stressed by work',
    'I am looking forward to the weekend',
  ]

  export const bypassOnboarding = async (page: Page) => {
    await page.goto('/')

    // Confirm onboarding entry CTA is visible and click on it to create an anonymous user
    await page.getByTestId('initiate-onboarding-btn').click()
    await page.waitForURL('/onboarding-new', { timeout: 30000 })

    // Gets the templateId which is a data-testid on the compose view to determine which template we are using
    await page.waitForTimeout(2000)
    const isV6 = await page.isVisible('[data-testid="onboarding-v6"]', {
      timeout: 5000,
    })

    if (isV6) {
      // Cannot skip onboarding
      await completeOnboarding(page)
      // Finish
      await finishEntry(page)
      // Close all modals
      await closeOnboardingModalsAndCreateAccount(page)
      await page.waitForTimeout(1000)
      // Indicates if you complete an entry you do not need the streak modal to close it was completed during onboarding
      return false
    } else {
      await page.waitForTimeout(1000)
      await expect(page.getByTestId('skip-button')).toBeVisible()
      await page.getByTestId('skip-button').click()
      await page.waitForTimeout(1000)
      // Creating an Account
      await createAccount(page)
      await page.waitForTimeout(1000) // Delay allows for fake loading to happen
      // Indicates if you complete an entry you need the streak modal to close it was not completed during onboarding
      return true
    }
  }

  export const completeOnboarding = async (page: Page) => {
    // Make sure you click the onboarding button prior to running this await page.getByTestId('initiate-onboarding-btn').click()

    await page.waitForTimeout(2000)
    // Gets the templateId which is a data-testid on the compose view to determine which template we are using
    const isV6 = await page.isVisible('[data-testid="onboarding-v6"]', {
      timeout: 5000,
    })
    const onboardingTemplate = isV6
      ? onboardingTemplateV6
      : onboardingTemplateV5

    if (!isV6) {
      await expect(page.getByTestId('skip-button')).toBeVisible({
        timeout: 10000,
      })
    }

    const firstPrompt = (onboardingTemplate.prompts[0].content as string[])[0]
    const entryStartIndex = onboardingTemplate.prompts.findIndex(
      (p) => p.id === onboardingTemplate.entryBeginsAtPromptId
    )

    if (entryStartIndex === -1) {
      throw new Error('Entry start index not found')
    }

    // Verify that the first prompt is visible
    await expect(
      await page.getByTestId('compose-active-prompt-0').textContent()
    ).toMatch(firstPrompt)

    // Passing in the onboarding template here to answer onboarding questions
    for (const [i, prompt] of onboardingTemplate.prompts.entries()) {
      // Skip button should be visible
      if (i < entryStartIndex && !isV6) {
        await expect(page.getByTestId('skip-button')).toBeVisible()
      }

      // Select options
      if (['select', 'multi-select'].includes(prompt.input) && prompt.options) {
        const randOption = Math.floor(Math.random() * prompt.options.length)
        await page
          .getByTestId(`compose-response-input-option-${randOption}`)
          .click()
      }

      // Handle text inputs
      if (prompt.input === 'text') {
        await page.waitForTimeout(1000)

        try {
          await expect(page.getByTestId('compose-response-input')).toBeVisible()
        } catch (_) {
          // At one version of the onboarding we are getting propmt suggestions instead of the response input
          await page.getByTestId('prompt-suggestion-0').click()
        }
        // flaky on CI adding timeout
        await page.waitForTimeout(500)
        await page.getByTestId('compose-response-input').click()
        await page
          .getByTestId('compose-response-input')
          .fill(E2EHelpers.entryAnswers[0])
      }
      // flaky on CI adding timeout
      await page.waitForTimeout(750)
      const submitButton = page.getByTestId('compose-response-submit')
      await expect(submitButton).toBeVisible({ timeout: 30000 })
      await submitButton.click()
    }
  }

  export const closeOnboardingModals = async (page: Page) => {
    const extraTimeoutForListeners = { timeout: 10000 }

    await page
      .getByTestId('notification-promo-close')
      .click(extraTimeoutForListeners)
    await page
      .getByTestId('upgrade-promo-close')
      .click(extraTimeoutForListeners)
    await page
      .getByTestId('install-app-modal-close')
      .click(extraTimeoutForListeners)
  }

  export const closeOnboardingModalsAndCreateAccount = async (page: Page) => {
    const extraTimeoutForListeners = { timeout: 10000 }

    await createAccount(page)
    await page.waitForTimeout(1000) // Delay allows for fake loading to happen
    await page
      .getByTestId('notification-promo-close')
      .click(extraTimeoutForListeners)
    await page
      .getByTestId('upgrade-promo-close')
      .click(extraTimeoutForListeners)
    await page.waitForTimeout(1000) // Delay allows for fake loading to happen
    await page
      .getByTestId('install-app-modal-close')
      .click(extraTimeoutForListeners)
  }

  export const completeRoseBudThorn = async (page: Page) => {
    await page.getByTestId('compose-response-input').click()
    await page.getByTestId('compose-response-input').fill(entryAnswers[0])
    await expect(
      await page.getByTestId('compose-response-submit')
    ).toBeVisible()
    await page.getByTestId('compose-response-submit').click()

    await expect(page.getByTestId('prompt-response-0')).toBeVisible()
    await expect(
      await page.getByTestId('prompt-response-0').textContent()
    ).toEqual(entryAnswers[0])

    await page.waitForTimeout(1000) // Delay allows for fake loading to happen

    await page.getByTestId('compose-response-input').click()
    await page.getByTestId('compose-response-input').fill(entryAnswers[1])
    await expect(page.getByTestId('compose-response-submit')).toBeVisible()
    await page.getByTestId('compose-response-submit').click()

    await expect(page.getByTestId('prompt-response-1')).toBeVisible()
    await expect(
      await page.getByTestId('prompt-response-1').textContent()
    ).toEqual(entryAnswers[1])

    await page.waitForTimeout(1000)

    await page.getByTestId('compose-response-input').click()
    await page.getByTestId('compose-response-input').fill(entryAnswers[2])
    await expect(
      await page.getByTestId('compose-response-submit')
    ).toBeVisible()
    await page.getByTestId('compose-response-submit').click()

    await expect(page.getByTestId('prompt-response-2')).toBeVisible()
    await expect(
      await page.getByTestId('prompt-response-2').textContent()
    ).toEqual(entryAnswers[2])
  }

  export const finishEntry = async (page: Page, withStreak = true) => {
    // Finish
    await expect(page.getByTestId('finish-entry-button')).toBeVisible({
      timeout: 20000,
    })
    await page.waitForTimeout(2000) // Entry button needs to load before click

    // Tooltip on mobile blocks finish entry button so you have to close tooltip need to loop through all 3 visible on page
    // const closeButtons = page.locator('[data-testid="tooltip-Close-Btn"]')
    // const count = await closeButtons.count()

    // for (let i = 0; i < count; i++) {
    //   const button = closeButtons.nth(i)
    //   if (await button.isVisible()) {
    //     await button.click()
    //     await page.waitForTimeout(100) // adjust the time as needed
    //   }
    // }

    await page.getByTestId('finish-entry-button').click()

    // View summary
    await expect(page).toHaveURL(/summary.*/, {
      timeout: 30000,
    })
    await expect(page.getByTestId('summary-done-button')).toBeVisible({
      timeout: 60000,
    })

    await expect(page.getByTestId('summary-done-button')).toBeEnabled()
    await page.getByTestId('summary-done-button').click({ timeout: 30000 })

    // View streak
    if (withStreak) {
      await expect(await page.getByTestId('streak-done-button')).toBeVisible()
      await expect(await page.getByTestId('streak-done-button')).toBeEnabled()
      await page.getByTestId('streak-done-button').click({ timeout: 30000 })
      await expect(page).not.toHaveURL(/summary.*/, { timeout: 30000 })
    }
  }

  export const createAccount = async (page: Page) => {
    const randomNumber = Math.floor(Math.random() * 1000000)
    const email = `michaelburner1818+${randomNumber}@gmail.com`
    const password = 'Test123!'

    // Creating an Account
    await page.getByTestId('email-input').fill(email)
    await page.getByTestId('password-input').fill(password)
    await page.getByTestId('sign-up-create-account').click()
    await page.waitForTimeout(2000)
  }
}
