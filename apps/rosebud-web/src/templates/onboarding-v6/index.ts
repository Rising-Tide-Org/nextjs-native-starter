import { ComposeResponse, ComposeTemplate } from 'types/Compose'
import { Template } from 'lib/template'
import { kSupportStyleMap } from 'constants/personalization'

// This function returns the right daily check-in for the current time of day
const kDailyEntryTemplate = Template.getTemplateForCheckIn(true)

const onboardingTemplateV6: ComposeTemplate = {
  id: 'onboarding-v6',
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
        'What is your primary goal for journaling?',
      ],
      input: 'select',
      contentType: 'static',
      options: [
        '😌 Improving my mental health',
        '🧠 Understanding myself better',
        '📈 Boosting cognitive function',
        '🫂 Receiving emotional support',
        '☀️ Reflecting on daily life',
      ],
      noneOption: '🤔 Just curious',
      shouldShuffleOptions: true,
      showOtherOption: true,
    },
    {
      id: 'age',
      content: [
        "Great! Now, let's tailor fit Rosebud to you.",
        '🎂 How many years young are you?',
      ],
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
      id: 'occupation',
      content: ['What is your primary occupation?'],
      input: 'select',
      contentType: 'static',
      options: [
        '🎓 Student',
        '💼 Professional',
        '🏠 Homemaker',
        '🌴 Retired',
        '🙅‍♂️ Unemployed',
      ],
      showOtherOption: true,
    },
    {
      id: 'relationship',
      content: ["What's your relationship status?"],
      input: 'select',
      contentType: 'static',
      options: [
        '🙋‍♂️ Single',
        '🥰 In a relationship',
        '💍 Married',
        '💔 Divorced',
        '🕯️ Widowed',
      ],
      noneOption: 'Prefer not to say',
    },
    {
      id: 'spirituality',
      content: ['What is your faith or spiritual orientation?'],
      input: 'select',
      contentType: 'static',
      options: [
        '☸️ Buddhist',
        '✝️ Christian',
        '🕉️ Hindu',
        '✡️ Jewish',
        '☪️ Muslim',
        '💟 Spiritual, but not religious',
      ],
      noneOption: 'Prefer not to answer',
      showOtherOption: true,
    },
    {
      id: 'support-style',
      content: ['What style of support best suits you?'],
      input: 'multi-select',
      contentType: 'static',
      options: Object.keys(kSupportStyleMap),
      shouldShuffleOptions: true,
      maxSelections: 2,
    },
    {
      id: 'daytime',
      contentType: 'static',
      content: ['Lastly, when would you like to journal?'],
      options: ['🌞 Mornings', '🌈 Afternoons', '🌇 Evenings'],
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

export default onboardingTemplateV6
