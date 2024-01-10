import { UserFlag } from 'types/User'

/**
 * These are the fields that we want to save to the user object
 */
export const kOnboardingUserFields = [
  'name',
  'goal',
  'struggles',
  'age',
  'identity',
  'focus',
  'daytime',
  'frequency',
  'journaling',
  'occupation',
  'relationship',
  'spirituality',
  'support-style',
]

export const coachMarks: { [key: string]: string } = {
  [UserFlag.digDeeperTipSeen]:
    'Rosebud AI can help you dig deeper with personalized questions.',
  [UserFlag.finishEntryTipSeen]:
    'When you are finished writing, Rosebud AI will analyze your entry.',
  [UserFlag.entitiesTipSeen]:
    'Rosebud can provide you actionable insights based on your entries.',
  [UserFlag.newManifestTipSeen]:
    'Add items to your happiness recipe and track your progress.',
  [UserFlag.bookmarkTipSeen]:
    'Bookmark prompts you like and save them for later.',
  [UserFlag.changeQuestionTipSeen]:
    "Don't like this question? You can ask the AI for a different question.",
  [UserFlag.suggestionsTipSeen]:
    'Stuck? Rosebud can provide some guidance to help you move forward',
  [UserFlag.journalModeTipSeen]:
    'You can toggle between focused and interactive journaling modes.',
  [UserFlag.weeklySummaryTipSeen]:
    'Unlock personal insights every Sunday after writing 3 entries.',
  [UserFlag.askRosebudTipSeen]:
    'Rosebud can answer any question based on what it knows about you from your entries.',
}

export const onboardingTips = [
  'Journaling reduces stress by providing an outlet to externalize emotions and thoughts.',
  'Journaling can improve mental clarity and problem-solving skills by helping you reflect.',
  'Journaling can help you identify and overcome negative thought patterns.',
  'Journaling boosts memory retention by solidifying and improving your recall.',
  'By writing out your thoughts and feelings, it can improve your communication skills.',
  'Journaling nurtures personal growth via progress tracking and pattern analysis.',
  'Daily journaling can boost self-esteem and self-awareness through introspection.',
  'Journaling promotes resilience by processing challenging events and encouraging closure.',
]
