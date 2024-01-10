import { ChatCompletionMessageParam } from 'openai/resources'
import { JournalMode } from './User'

type ComposeTemplatePromptId = string
type ComposeDynamicStringArray = (responses: ComposeResponse[]) => string[]
type ComposeDynamicAiContent = (
  responses: ComposeResponse[]
) => ChatCompletionMessageParam[] // This is an OpenAI type
type ComposeDynamicContent =
  | ComposeDynamicStringArray
  | ComposeDynamicAiContent
  | string[]

export type ComposePromptMode = 'guided' | 'freeform'
export type ComposeFinishMode =
  | 'auto'
  | 'always'
  | 'afterFirstPrompt'
  | 'lastTemplatePrompt'
export type ComposeDraftMode = 'cloud' | 'local'

export type ComposeTemplateSetting = {
  allowVoiceForFreeUsers?: boolean
  digDeeperOnInitialResponse?: boolean // Immediately runs dig deeper on initial response
  disableCoachMarks?: boolean
  disableDigDeeper?: boolean
  disableGuidingLight?: boolean
  disablePersonalization?: boolean
  disableProgressBar?: boolean
  disableSwapQuestion?: boolean
  disableVoice?: boolean
  dontSaveEntry?: boolean
  forceJournalMode?: JournalMode
  draftMode?: ComposeDraftMode
}

// High-level template definition
export type ComposeTemplate = {
  id: string // Unique identifer, used to track drafts
  saveId?: string // Override the template id used when saving the entry
  analyticsId?: string // Unique identifier for analytics (e.g. id is prompt-23, but analytics id is prompt)
  name?: string | ((responses: ComposeResponse[]) => string) // e.g. Rose, Bud, Thorn, can be dynamic
  prompts: ComposeTemplatePrompt[]
  initialResponse?: string[]
  shouldShowProgress?: boolean // Show progress of prompts (e.g. in onboarding)
  estimatedPromptCount?: number // Used to show progress when auto finish is enabled
  minDigDeepers?: number // Force user to do at least N dig deepers before finishing
  finishMode?: ComposeFinishMode // Determines the behavior of when the finish button appears
  entryBeginsAtPromptId?: ComposeTemplatePromptId // Everything from this point forward is sent to AI and saved as entry
  metadata?: Record<string, any> // Arbitrary data to stored in the template
  settings?: ComposeTemplateSetting // Features to enable for this template
  finishButtonLabel?: string // Override the default "Finish" button label
  hideBackButton?: boolean
  // Override the default "Finish" button style
  finishButtonStyle?: {
    variant?: string
    colorScheme?: string
    hideIcon?: boolean
  }
}

// Defines how a prompt behaves
type BaseTemplatePrompt = {
  id?: ComposeTemplatePromptId
  input: 'multi-select' | 'select' | 'text' | 'segue'
  contentType: 'static' | 'dynamic' | 'ai'
  shouldShuffleOptions?: boolean // Shuffles multi-select and select options
  placeholder?: string // Optional placeholder for text input
  buttonLabel?: string // Define the "Continue" button label
  noneOption?: string // Define the "None" option for multi-select and select
  showOtherOption?: boolean // Show the "Other" option for multi-select and select
  maxSelections?: number // Max number of selections for multi-select
  isRequired?: boolean // Whether or not the prompt is required to enable the continue button
}

// Dynamic prompts can show different content based on previous responses
export type ComposeTemplatePrompt = BaseTemplatePrompt & {
  content?: ComposeDynamicContent // Static, dynamic, or ai-generated content, can show multiple messages
  options?: ((responses: ComposeResponse[]) => string[]) | string[] // For use with multi-select and select
  isShown?: (responses: ComposeResponse[]) => boolean // Conditionally show a prompt, with access to previous responses
}

// Final shape of a prompt, after derivation
export type ComposePrompt = BaseTemplatePrompt & {
  content: string[]
  options?: string[]
  shouldShuffleOptions?: boolean
  isShown?: boolean
}

// These are responses to prompts
export type ComposeResponse = {
  id?: ComposeTemplatePromptId
  date?: string
  prompt: ComposePrompt
  response: string[]
  entryId?: string // Used to track responses that are part of the same entry
}

// This is how we store a draft in local storage
export type ComposeDraft = {
  template?: ComposeTemplate
  responses?: ComposeResponse[]
}

// Suggestions to choose from (e.g. dig deeper or manifest)
export type ComposeSuggestion = {
  type: 'prompts' | 'actions'
  options: string[]
}

export type ComposeTemplateTag =
  | 'Daily'
  | 'Mindset'
  | 'Sleep'
  | 'Communication'
  | 'Goals'

// For use in the marketplace / explore
export type ComposeTemplateMetadata = {
  templateId: string // id of template
  name: string // template title
  description: string // template description
  minutes: number // Number of minutes to complete
  timeofDayRange?: number[]
  tags: ComposeTemplateTag[]
  weight?: number // Starting weight for sorting
}

export type ComposeRecordingState = 'recording' | 'transcribing' | 'stopped'

export type ComposeAidType =
  | 'nudge'
  | 'challenge'
  | 'perspective'
  | 'traps'
  | 'reframe'
