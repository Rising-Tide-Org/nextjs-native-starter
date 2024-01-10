import { ComposeTemplateMetadata } from 'types/Compose'
import {
  ConversationPrep,
  Dream,
  Gratitude,
  MorningIntention,
  NewYear,
  Reframing,
  RoseBudThorn,
  ThemedIconProps,
} from 'ui/shared/Illustration'

export const kJournals: ComposeTemplateMetadata[] = [
  {
    templateId: 'new-year-2024',
    name: "New Year's Resolutions",
    description: 'Make 2024 your best year yet.',
    minutes: 8,
    tags: ['Goals'],
    weight: 100,
  },
  {
    templateId: 'morning-intention',
    name: 'Morning Intention',
    description:
      'Set your day up for success by approaching it with intention.',
    minutes: 5,
    timeofDayRange: [4, 12],
    tags: ['Daily'],
    weight: -50,
  },
  {
    templateId: 'gratitude',
    name: 'Gratitude Journal',
    description: "Take a moment to connect with what you're grateful for.",
    minutes: 5,
    tags: ['Mindset'],
  },
  {
    templateId: 'dream',
    name: 'Dream Journal',
    description:
      'Unlock insights from your dreams and interpret their meaning.',
    minutes: 5,
    timeofDayRange: [4, 10],
    tags: ['Sleep'],
  },
  {
    templateId: 'rose-bud-thorn',
    name: 'Evening Reflection',
    description: 'How was your day? Take a moment to reflect.',
    minutes: 5,
    timeofDayRange: [17, 3],
    tags: ['Daily'],
    weight: -50,
  },
  {
    templateId: 'reframing',
    name: 'Reframing Negative Thoughts',
    description:
      'A CBT exercise to help you improve your relationship with your thoughts.',
    minutes: 10,
    tags: ['Mindset'],
  },
  {
    templateId: 'conversation-prep',
    name: 'Conversation Prep',
    description:
      'Prepare for an important conversation and get the outcome you want.',
    minutes: 10,
    tags: ['Communication'],
  },
]

export const illustrationToTemplateIdMap: Record<
  string,
  (props: ThemedIconProps) => JSX.Element
> = {
  'morning-intention': MorningIntention,
  gratitude: Gratitude,
  dream: Dream,
  'rose-bud-thorn': RoseBudThorn,
  reframing: Reframing,
  'conversation-prep': ConversationPrep,
  'new-year-2024': NewYear,
}
