import { AskItem } from 'types/Ask'
import { ComposeTemplate } from 'types/Compose'

const generateAskTemplate = (ask: AskItem): ComposeTemplate => ({
  id: `ask-${ask.id}`,
  name: 'Ask Rosebud',
  finishMode: 'afterFirstPrompt',
  analyticsId: 'ask-rosebud',
  prompts: [
    {
      id: `ask-${ask.id}`,
      input: 'text',
      contentType: 'static',
      content: ['Ask anything about yourself...'],
    },
  ],
  initialResponse: [ask.content!],
  settings: {
    digDeeperOnInitialResponse: true,
    forceJournalMode: 'interactive',
  },
})

export default generateAskTemplate
