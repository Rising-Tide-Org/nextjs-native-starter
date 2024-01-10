import { ComposeTemplate } from 'types/Compose'

const dreamTemplate: ComposeTemplate = {
  id: 'dream',
  name: 'Dream Journal',
  shouldShowProgress: true,
  estimatedPromptCount: 6,
  finishMode: 'auto',
  prompts: [
    {
      id: 'dream-1',
      input: 'text',
      contentType: 'static',
      content: ['Can you describe your dream with as much detail as possible?'],
    },
  ],
}

export default dreamTemplate
