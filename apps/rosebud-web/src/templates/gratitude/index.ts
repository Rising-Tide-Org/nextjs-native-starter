import { ComposeTemplate } from 'types/Compose'

const gratitudeTemplate: ComposeTemplate = {
  id: 'gratitude',
  name: 'Gratitude journal',
  estimatedPromptCount: 6,
  shouldShowProgress: true,
  finishMode: 'auto',
  prompts: [
    {
      id: 'grateful',
      input: 'text',
      contentType: 'static',
      content: ['Can you name 3 things you are grateful for today?'],
    },
  ],
}

export default gratitudeTemplate
