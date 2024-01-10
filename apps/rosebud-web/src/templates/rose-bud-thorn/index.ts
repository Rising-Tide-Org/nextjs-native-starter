import { ComposeTemplate } from 'types/Compose'

export const kRoseBudThornQuestions = {
  rose: [
    "🌹 What's one positive thing that happened today?",
    "🌹 What's something you're grateful for today?",
    "🌹 What's one win, small or big, you had today?",
    '🌹 What was the highlight of your day?',
  ],
  thorn: [
    "🥀 What's something that caused you tension today?",
    "🥀 What's been a source of stress for you today?",
    '🥀 What was challenging for you today?',
    '🥀 What challenge or obstacle did you face today?',
    '🥀 What was the most challenging part of your day?',
  ],
  bud: [
    "🌱 What's something you're looking forward to?",
    '🌱 Did you experience any growth or inspiration today?',
    '🌱 What new idea or opportunity emerged today?',
    "🌱 What's something new or interesting that you learned today?",
  ],
}

const roseBudThornTemplate: ComposeTemplate = {
  id: 'rose-bud-thorn',
  analyticsId: 'daily', // Backwards compatibility
  name: 'Daily check-in',
  shouldShowProgress: true,
  prompts: [
    {
      id: 'rose',
      input: 'text',
      contentType: 'static',
      content: [
        kRoseBudThornQuestions.rose[
          Math.floor(Math.random() * kRoseBudThornQuestions.rose.length)
        ],
      ],
    },
    {
      id: 'thorn',
      input: 'text',
      contentType: 'static',
      content: [
        kRoseBudThornQuestions.thorn[
          Math.floor(Math.random() * kRoseBudThornQuestions.thorn.length)
        ],
      ],
    },
    {
      id: 'bud',
      input: 'text',
      contentType: 'static',
      content: [
        kRoseBudThornQuestions.bud[
          Math.floor(Math.random() * kRoseBudThornQuestions.bud.length)
        ],
      ],
    },
  ],
}

export default roseBudThornTemplate
