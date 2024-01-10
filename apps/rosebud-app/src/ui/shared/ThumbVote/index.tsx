import { Flex, IconButton, useToast } from '@chakra-ui/react'
import Analytics from 'lib/analytics'
import { useState, useCallback, useRef } from 'react'
import MakeToast from 'ui/core/MakeToast'
import { RbThumbsUp, RbThumbsDown } from '../Icon'

type ThumbVoteValue = 'like' | 'dislike'

type Props = {
  only?: ThumbVoteValue
  analyticsPrefix: string
}

const ThumbVote = ({ only, analyticsPrefix }: Props) => {
  const toast = useToast()
  const timeoutRef = useRef<number>()
  const [feedback, setFeedback] = useState<ThumbVoteValue | undefined>()

  const handleFeedback = useCallback(
    (vote: ThumbVoteValue) => {
      if (feedback === vote) {
        return
      }
      const emoji = vote === 'like' ? '👍' : '👎'

      // Debounce the event to avoid spamming
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = window.setTimeout(() => {
        Analytics.trackEvent(`${analyticsPrefix}.${vote}`)
      }, 3000)

      setFeedback(vote)
      toast(
        MakeToast({
          title: 'Feedback sent',
          description:
            vote === 'dislike'
              ? `We'll strive to do better! ${emoji} `
              : `We're glad you liked it! ${emoji} `,
        })
      )
    },
    [analyticsPrefix, feedback, toast]
  )

  return (
    <Flex>
      {(!only || only === 'like') && (
        <ThumbVoteButton
          type='like'
          selected={feedback}
          onSelect={handleFeedback}
        />
      )}

      {(!only || only === 'dislike') && (
        <ThumbVoteButton
          type='dislike'
          selected={feedback}
          onSelect={handleFeedback}
        />
      )}
    </Flex>
  )
}

const ThumbVoteButton = ({
  type,
  selected,
  onSelect,
}: {
  type: ThumbVoteValue
  selected?: ThumbVoteValue
  onSelect: (vote: ThumbVoteValue) => void
}) => {
  const isSelected = selected === type
  return (
    <IconButton
      variant='ghost'
      aria-label='thumbs down'
      size='sm'
      icon={
        type === 'like' ? (
          <RbThumbsUp boxSize='16px' />
        ) : (
          <RbThumbsDown boxSize='16px' />
        )
      }
      _hover={{ bg: isSelected && 'transparent' }}
      cursor={isSelected ? 'default' : 'pointer'}
      color={
        isSelected ? 'blue.500' : isSelected ? 'brandGray.300' : 'brandGray.500'
      }
      onClick={() => onSelect(type)}
    />
  )
}

export default ThumbVote
