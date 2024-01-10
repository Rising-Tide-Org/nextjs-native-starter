import {
  PlaywrightTestArgs,
  PlaywrightTestOptions,
  PlaywrightWorkerArgs,
  PlaywrightWorkerOptions,
} from '@playwright/test'

const globalAPIMock = async ({
  page,
}: PlaywrightTestArgs &
  PlaywrightTestOptions &
  PlaywrightWorkerArgs &
  PlaywrightWorkerOptions) => {
  await page.route('*/**/api/extractEntities', async (route) => {
    const json = {
      response: {
        emotions: [],
        people: [
          { name: 'uncle Joe', relation: 'Family' },
          { name: 'grandmother Lucy', relation: 'Family' },
          { name: 'Sarah', relation: 'Daughter' },
        ],
        places: ['city center'],
        topics: ['#smoking', '#birthday', '#publictransport', '#music'],
      },
    }
    await route.fulfill({ json })
  })

  await page.route('*/**/api/generatePrompt', async (route) => {
    const json = {
      response: [
        {
          type: 'personal',
          question:
            'What was the most exciting idea from the brainstorming session?',
        },
        {
          type: 'personal',
          question: 'How do you plan to implement the innovative ideas?',
        },
        {
          type: 'personal',
          question:
            'How did the brainstorming session impact your perspective on innovation?',
        },
        {
          type: 'notification',
          question: 'Have any of the brainstorming ideas been implemented yet?',
        },
        {
          type: 'notification',
          question:
            'How is the progress on the innovative ideas from the brainstorming session?',
        },
        {
          type: 'notification',
          question: 'Have you had any more brainstorming sessions recently?',
        },
      ],
    }
    await route.fulfill({ json })
  })

  // Streaming route
  await page.route('*/**/api/stream/generatePrompts', async (route) => {
    const responseText = `1. What steps can I take to break my smoking habit?
        2. What positive memories do I have of spending time with uncle Joe and grandmother Lucy?
        3. How can I prepare for Sarah's birthday and make it special?`
    await route.fulfill({
      body: responseText,
      contentType: 'text/plain',
      status: 200,
    })
  })

  // Streaming route
  await page.route('*/**/api/stream/digDeeper', async (route) => {
    const responseText = "That's great to hear"
    await route.fulfill({
      body: responseText,
      contentType: 'text/plain',
      status: 200,
    })
  })

  // Streaming route
  await page.route('*/**/api/stream/suggestCommitments', async (route) => {
    const responseText = `1. 🥰 Spend time with family
        2. 🧘 Practice mindfulness
        3. 🏃 Exercise regularly
      `
    await route.fulfill({
      body: responseText,
      contentType: 'text/plain',
      status: 200,
    })
  })

  // Streaming route
  await page.route('*/**/api/stream/entryReflection', async (route) => {
    const responseText =
      "Testing\n\nIt's a beautiful day, innit? Fresh powder on the slopes today, looks gnarly. Good day to shred some gnar and bomb some hills. Looking forward to hitting the side features and working on some new tricks."
    await route.fulfill({
      body: responseText,
      contentType: 'text/plain',
      status: 200,
    })
  })

  // Streaming route
  await page.route('*/**/api/stream/generateContent', async (route) => {
    const responseText = 'Hey you are amazing and your tests are gonna pass'
    await route.fulfill({
      body: responseText,
      contentType: 'text/plain',
      status: 200,
    })
  })
}

export default globalAPIMock
