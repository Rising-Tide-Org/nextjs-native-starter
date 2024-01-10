import { ComposeTemplate } from 'types/Compose'

const template: ComposeTemplate = {
  id: 'conversation-prep',
  name: 'Conversation Prep',
  shouldShowProgress: true,
  estimatedPromptCount: 10,
  finishMode: 'auto',
  prompts: [
    {
      id: 'background',
      input: 'text',
      contentType: 'static',
      content: [
        'What’s this conversation about? Who’s involved and what’s your relationship with them?',
      ],
    },
  ],
}

export default template
