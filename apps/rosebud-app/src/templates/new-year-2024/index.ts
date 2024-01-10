import { ComposeTemplate } from 'types/Compose'

const newYearTemplate: ComposeTemplate = {
  id: 'new-year-2024',
  name: "New Year's Resolutions",
  shouldShowProgress: true,
  hideBackButton: true,
  estimatedPromptCount: 5,
  finishMode: 'auto',
  settings: {
    allowVoiceForFreeUsers: true,
    disablePersonalization: true,
  },
  prompts: [
    {
      id: 'new-year-2024-1',
      input: 'text',
      contentType: 'static',
      content: [
        "Welcome to your New Year's Resolution journal for 2024!",
        "In the next 10 mins, we'll help you reflect on this year, dream big, and set your path for an amazing 2024",
        "Let's start by reflecting on 2023.",
        'List your top 3 moments from 2023. What made these moments significant?',
      ],
    },
  ],
}

export default newYearTemplate
