export type PromptType = 'personal' | 'notification' | 'bookmarks'

export type Prompt = {
  id: string
  type: PromptType // The type of prompt
  question: string // The prompt question
  isBookmarked?: boolean // Whether the prompt is bookmarked
  isVisible?: boolean // Date after which the prompt should be shown
  createdAt?: string // Date the prompt was created
}
