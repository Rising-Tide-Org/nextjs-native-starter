import { ComposeTemplate } from 'types/Compose'

const kCancellationReasons = [
  "It's too expensive",
  'Need different/more features',
  'Found an alternative',
  'Experienced technical issues',
  'Didn’t use it enough',
]

const kNoneOption = 'Something else'

/**
 * This template is used as the offboarding survey
 */
const cancelTemplate: ComposeTemplate = {
  id: 'cancel',
  name: 'Cancel subscription',
  finishButtonLabel: 'Confirm',
  finishButtonStyle: {
    variant: 'primary',
    colorScheme: 'brand',
    hideIcon: true,
  },
  finishMode: 'lastTemplatePrompt',
  settings: {
    disableDigDeeper: true,
    disableGuidingLight: true,
    dontSaveEntry: true,
    draftMode: 'local',
    forceJournalMode: 'interactive',
    allowVoiceForFreeUsers: true,
    disableCoachMarks: true,
    disablePersonalization: true,
    disableVoice: true,
  },
  prompts: [
    {
      id: 'reason',
      input: 'select',
      contentType: 'static',
      content: ['Why are you canceling your subscription?'],
      shouldShuffleOptions: true,
      // Make a copy of the array otherwise it will be shuffled in place
      options: [...kCancellationReasons],
      noneOption: kNoneOption,
    },
    {
      id: 'more-details',
      input: 'text',
      contentType: 'static',
      isRequired: true,
      content: (responses) => {
        switch (responses[0].response[0]) {
          case kCancellationReasons[0]:
            return ['What would you be willing to pay?']
          case kCancellationReasons[1]:
            return ['How could we make it more useful for you?']
          case kCancellationReasons[2]:
            return ['What’s the alternative?']
          case kCancellationReasons[3]:
            return ['What issues did you run into?']
          case kCancellationReasons[4]:
            return ['What prevented you from using it often?']
          case kNoneOption:
            return ['Can you tell us more?']
          default:
            return ['What would make it better?']
        }
      },
    },
  ],
}

export default cancelTemplate
