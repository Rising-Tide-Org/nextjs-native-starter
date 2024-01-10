import { ComposeTemplate } from 'types/Compose'

const reframingTemplate: ComposeTemplate = {
  id: 'reframing',
  name: 'Reframing',
  estimatedPromptCount: 10,
  shouldShowProgress: true,
  finishMode: 'auto',
  prompts: [
    {
      id: 'thought',
      input: 'text',
      contentType: 'static',
      content: ['What negative thought you are experiencing?'],
    },
  ],
}

export default reframingTemplate
