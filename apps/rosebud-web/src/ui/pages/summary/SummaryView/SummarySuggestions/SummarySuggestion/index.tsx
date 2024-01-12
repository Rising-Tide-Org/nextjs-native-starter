import { Button, Divider, Flex, Link, Tag, Text } from '@chakra-ui/react'
import { useMemo } from 'react'
import {
  CollectionItemGoalInterval,
  intervalToLabelMap,
} from 'types/Collection'
import { UserFlag } from 'types/User'
import { kViewPadding } from 'shared/ui/constants'
import MotionBox from 'shared/ui/core/MotionBox'
import CoachMark from 'ui/shared/CoachMark'
import { RbCheckmark } from 'ui/shared/Icon'
import ThumbVote from 'ui/shared/ThumbVote'

type Props = {
  interval: CollectionItemGoalInterval
  completionsRequired?: number
  title: string
  description: string
  goalId: string | undefined
  onRemove: (goalId: string) => void
  onAdd: (
    title: string,
    desc: string,
    interval: CollectionItemGoalInterval,
    rate: number
  ) => void
  showTip?: boolean
}

const SummarySuggestion = ({
  interval,
  completionsRequired,
  title,
  description,
  goalId,
  onRemove,
  onAdd,
  showTip = false,
}: Props) => {
  const onSelect = () => {
    onAdd(title, description, interval, completionsRequired ?? 0)
  }

  // Wrap the button in a CoachMark if we want to show a tip
  const manifestButton = useMemo(() => {
    const button = (
      <Button variant='primary' size='sm' onClick={onSelect} minW='120px'>
        Manifest
      </Button>
    )
    if (showTip) {
      return (
        <CoachMark
          isDisabled={!showTip}
          flag={UserFlag.newManifestTipSeen}
          delay={500}
          offset={[0, 10]}
        >
          {button}
        </CoachMark>
      )
    }
    return button
  }, [title, description, onAdd, showTip])

  return (
    <MotionBox
      rounded='md'
      border='1px solid'
      borderColor='inherit'
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{
        duration: 0.5,
        ease: [0.43, 0.13, 0.23, 1],
      }}
      overflow='hidden'
      py={4}
    >
      <Flex justifyContent='space-between' mx={kViewPadding} mb={2}>
        <Text data-sentry-block>{title}</Text>
        {interval && (
          <Tag
            size='sm'
            h='20px'
            ml={2}
            px={1}
            textTransform='uppercase'
            fontSize={10}
            flexShrink={0}
          >
            {intervalToLabelMap[interval]}
          </Tag>
        )}
      </Flex>

      <Flex direction='column'>
        <Text
          variant='tertiary'
          fontWeight={400}
          px={kViewPadding}
          data-sentry-block
        >
          {description}
        </Text>

        <Divider my={4} />
        <MotionBox
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{
            duration: 0.5,
            ease: [0.43, 0.13, 0.23, 1],
          }}
          px={4}
          display='flex'
          justifyContent='space-between'
        >
          {goalId ? (
            <Flex align='center' gap={2} h='32px' w='full'>
              <RbCheckmark boxSize='18px' color='green.500' />{' '}
              <Text fontWeight={500} fontSize='15px'>
                Added
              </Text>
              <Link
                color='red.500'
                fontSize='15px'
                mr={2}
                onClick={() => onRemove(goalId)}
              >
                Undo
              </Link>
            </Flex>
          ) : (
            manifestButton
          )}
          {!goalId && (
            <ThumbVote
              only='dislike'
              analyticsPrefix='summary.suggestion.feedback'
            />
          )}
        </MotionBox>
      </Flex>
    </MotionBox>
  )
}

export default SummarySuggestion
