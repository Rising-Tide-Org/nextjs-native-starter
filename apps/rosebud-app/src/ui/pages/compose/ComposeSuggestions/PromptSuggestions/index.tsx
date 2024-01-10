import { leadingDigitRegex } from 'constants/regex'
import { useComposeProvider } from 'providers/ComposeProvider'
import { useCallback } from 'react'
import { ComposeSuggestion } from 'types/Compose'
import { kOptionSlideInTransition } from 'ui/constants'
import PromptLabel from 'ui/pages/compose/PromptLabel'

type Props = {
  suggestions: ComposeSuggestion
  onSelect: (prompt: string) => void
}

const PromptSuggestions = ({ suggestions, onSelect }: Props) => {
  const { activeResponse, isStreaming } = useComposeProvider()

  const handleSelect = useCallback(
    (prompt: string) => {
      if (!isStreaming) {
        onSelect(prompt)
      }
    },
    [isStreaming, onSelect]
  )

  // Note: This is a hack to get the selected prompt to animate in
  // without opacity changes when restoring previous suggestions
  const selectedPrompt = activeResponse?.prompt.content[0]

  return (
    <>
      {suggestions.options.map((prompt, i) => {
        const cleanPrompt = prompt.replace(leadingDigitRegex, '')
        const isLoading = cleanPrompt.trim().length === 0

        // Ignore prompts that don't start with a number
        // If empty, bypass this check to show loading state
        if (prompt.length > 0 && !prompt.match(leadingDigitRegex)) {
          return
        }

        // Manages the relationship between different layout animations
        // This is fragile, handle with care
        const layoutId = !isStreaming ? cleanPrompt : undefined
        const initial = isStreaming
          ? { opacity: selectedPrompt === cleanPrompt ? 1 : 0, x: -50 }
          : undefined
        const animate = isStreaming ? { opacity: 1, x: 0 } : undefined

        return (
          <PromptLabel
            isLoading={isLoading}
            layout={!isStreaming}
            key={isStreaming ? `${i}-stream` : i}
            data-testid={`prompt-suggestion-${i}`}
            cursor={isStreaming ? 'wait' : 'pointer'}
            _hover={{
              color: 'blue.400',
            }}
            onClick={() => handleSelect(cleanPrompt)}
            layoutId={layoutId}
            initial={initial}
            animate={animate}
            transition={kOptionSlideInTransition(i)}
            mb={1}
          >
            {cleanPrompt}
          </PromptLabel>
        )
      })}
    </>
  )
}

export default PromptSuggestions
