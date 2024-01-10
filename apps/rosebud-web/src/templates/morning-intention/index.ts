import { ComposeTemplate } from 'types/Compose'

const kMorningCheckInQuestions = {
  rose: [
    // '🌹 What could you do to make today better?',
    "🌹 What's your highest priority today?",
    // '🌹 What are you grateful for this morning?',
  ],
  thorn: [
    // '🥀 Is anything weighing on you this morning?',
    '🥀 Is there anything worrying you about the day ahead?',
    // '🥀 Can you anticipate any challenges today?',
  ],
  bud: [
    "🌱 What's one positive thing you can do for yourself today?",
    '🌱 What part of today are you most looking forward to?',
    // '🌱 Whose day could you make a little better today?',
  ],
}

const morningIntentionTemplate: ComposeTemplate = {
  id: 'morning-intention',
  name: 'Daily intention',
  shouldShowProgress: true,
  prompts: [
    {
      id: 'rose',
      input: 'text',
      contentType: 'static',
      content: [
        kMorningCheckInQuestions.rose[
          Math.floor(Math.random() * kMorningCheckInQuestions.rose.length)
        ],
      ],
    },
    {
      id: 'thorn',
      input: 'text',
      contentType: 'static',
      content: [
        kMorningCheckInQuestions.thorn[
          Math.floor(Math.random() * kMorningCheckInQuestions.thorn.length)
        ],
      ],
    },
    {
      id: 'bud',
      input: 'text',
      contentType: 'static',
      content: [
        kMorningCheckInQuestions.bud[
          Math.floor(Math.random() * kMorningCheckInQuestions.bud.length)
        ],
      ],
    },
  ],
}

export default morningIntentionTemplate
