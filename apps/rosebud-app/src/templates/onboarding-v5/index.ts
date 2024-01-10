import { ComposeResponse, ComposeTemplate } from 'types/Compose'
import { Template } from 'lib/template'

// This function returns the right daily check-in for the current time of day
const kDailyEntryTemplate = Template.getTemplateForCheckIn(true)

const onboardingTemplateV5: ComposeTemplate = {
  id: 'onboarding-v5',
  analyticsId: kDailyEntryTemplate.id, // Backwards compatibility - counts as daily
  settings: {
    allowVoiceForFreeUsers: true,
    disablePersonalization: true,
    draftMode: 'local',
  },
  // This saveId is a workaround for now to define what the onboarding template is saved as
  // to set the right state depending on which daily check-in was done during onboarding
  saveId: kDailyEntryTemplate.saveId ?? kDailyEntryTemplate.id,
  name: (responses: ComposeResponse[]) => {
    if (responses.find((r) => r.id === 'rose')) {
      return '✍️ First check-in'
    } else if (
      responses.length > 0 &&
      responses[responses.length - 1].id === 'interstitial'
    ) {
      return '🎉 Personalization complete!'
    } else if (responses.length > 1) {
      return 'Personalize your journal'
    }
    return '🌹 Welcome to Rosebud!'
  },
  shouldShowProgress: true,
  minDigDeepers: 1,
  entryBeginsAtPromptId: 'rose',
  prompts: [
    {
      id: 'goal',
      content: [
        'Our mission is to guide you to a more fulfilling life through self-reflection.',
        'What brings you to Rosebud?',
      ],
      input: 'multi-select',
      contentType: 'static',
      options: [
        'Level up my mental health 😌',
        'Boost my creativity 🎨',
        'Increase my productivity 📈',
        'Reflect on my daily life 🤔',
        'Track my personal growth ✨',
      ],
      shouldShuffleOptions: true,
    },
    {
      id: 'age',
      content: ['🎂 How many years young are you?'],
      input: 'select',
      contentType: 'static',
      options: ['Under 18', '18-24', '25-34', '35-44', '45-54', '55+'],
    },
    {
      id: 'identity',
      content: ['How do you identify?'],
      input: 'select',
      contentType: 'static',
      options: ['Male', 'Female', 'Non-binary', 'Prefer not to say'],
    },
    {
      id: 'focus',
      contentType: 'static',
      content: ['What areas of your life do you want to improve?'],
      options: [
        'Spirituality and personal growth 🌟',
        'Goals and dream chasing 🚀',
        'Career and finances 💼',
        'Relationships, family, and friends 💕',
        'Health, wellness, and self-care 💪',
        'Hobbies, interests, and passion projects 🌟',
      ],
      input: 'multi-select',
      shouldShuffleOptions: true,
    },
    {
      id: 'struggles',
      content: ['Have you been struggling with anything lately?'],
      input: 'multi-select',
      contentType: 'static',
      options: [
        'Anxiety 😰',
        'Grief 💔',
        'Depression 😥',
        'Loneliness 😔',
        'Anger 😠',
        'ADHD 🌀',
        'Sleep 💤',
      ],
      noneOption: 'None of these 🤗',
      shouldShuffleOptions: true,
    },
    {
      id: 'daytime',
      contentType: 'static',
      content: ['When would you like to journal?'],
      options: ['Mornings 🌞', 'Afternoons 🌈', 'Evenings 🌇'],
      shouldShuffleOptions: false,
      input: 'select',
    },
    {
      id: 'interstitial',
      content: [
        "🎉 Awesome! Now, let's complete your first entry.",
        'Everything you write is private and only visible to you.',
        'As you write, Rosebud can ask questions to help dig deeper into your experience.',
      ],
      input: 'segue',
      contentType: 'static',
      buttonLabel: "Let's go!",
    },
    ...kDailyEntryTemplate.prompts,
  ],
}

export default onboardingTemplateV5
