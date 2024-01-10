import {
  Flex,
  IconButton,
  Text,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react'
import useIsMobile from 'hooks/useIsMobile'
import { useMemo } from 'react'
import { IoIosCheckmarkCircle, IoMdThumbsUp } from 'react-icons/io'
import { TiDelete } from 'react-icons/ti'
import { CollectionItemGoal } from 'types/Collection'
import { getCompletionCount, isGoalCompleted } from 'util/goals'

type Props = {
  goal: CollectionItemGoal
  onToggle: (goal: CollectionItemGoal) => void
  onDelete: (goal: CollectionItemGoal) => void
  onEdit?: (goal: CollectionItemGoal) => void
  isEditing?: boolean
}

const CommitmentListItem = ({
  goal,
  onToggle,
  onEdit,
  onDelete,
  isEditing,
}: Props) => {
  const { interval, completionsRequired } = goal.metadata

  const completed = isGoalCompleted(goal)
  const isEditable = !(interval === 'once' && completed)

  let numCompletions = getCompletionCount(goal)

  // if user edits goal to require fewer completions, don't want a value > that from this past week to show.
  if (interval === 'weekly') {
    numCompletions = Math.min(getCompletionCount(goal), completionsRequired)
  }

  const completionCount = `${numCompletions} ${
    interval === 'weekly' ? `/ ${completionsRequired}` : ''
  }`

  const isMobile = useIsMobile()

  const completionsTextColor = useColorModeValue('gray.500', 'white')
  const pristineGoalBgColor = useColorModeValue('gray.100', 'gray.700')
  const pristineGoalBgColorHover = useColorModeValue('gray.200', 'gray.600')
  const hoverBgColor = useColorModeValue('brandGray.50', 'brandGray.750')

  const tooltipLabel = useMemo(() => {
    switch (interval) {
      case 'weekly':
        return 'Times completed this week'
      case 'forever':
        return 'Times completed'
      case 'once':
        return ''
    }
  }, [interval])

  return (
    <Flex
      gap={1}
      w='100%'
      _notLast={{
        borderBottom: '1px solid',
        borderColor: 'borderList',
      }}
      p='1px'
      bg='bg'
      _hover={
        isEditable
          ? {
              bg: hoverBgColor,
            }
          : {}
      }
    >
      <Flex
        py={2}
        pr={2}
        pl={3}
        w='100%'
        align='center'
        flex={1}
        position='relative'
        overflow='hidden'
        cursor={isEditable ? 'pointer' : 'inherit'}
        onClick={() => onEdit?.(goal)}
      >
        <Flex justify='space-between' alignItems='center' w='100%' zIndex={1}>
          <Text textAlign='left' data-sentry-block title={goal.description}>
            {goal.title}
          </Text>
          {(interval === 'weekly' ||
            (interval === 'forever' && numCompletions > 0)) && (
            <Tooltip
              shouldWrapChildren
              label={tooltipLabel}
              openDelay={1000}
              isDisabled={isMobile}
            >
              <Flex
                align='center'
                zIndex={1}
                flexShrink={0}
                ml={2}
                whiteSpace='nowrap'
              >
                <Text
                  fontSize='sm'
                  fontWeight={500}
                  color={completionsTextColor}
                >
                  {completionCount}
                </Text>
              </Flex>
            </Tooltip>
          )}
        </Flex>
      </Flex>
      {isEditing ? (
        <Flex alignItems='center'>
          <IconButton
            icon={<TiDelete />}
            bg='red.300'
            border='1px solid'
            borderColor='red.400'
            _hover={{
              bg: 'red.400',
            }}
            rounded='md'
            color='gray.50'
            w='30px'
            h='30px'
            p='1px'
            mr={2}
            minW='none'
            aria-label='Delete'
            onClick={() => onDelete(goal)}
          />
        </Flex>
      ) : (
        <Flex alignItems='center'>
          <Tooltip
            shouldWrapChildren
            label={`Mark ${completed ? 'incomplete' : 'complete'}`}
            openDelay={1000}
            isDisabled={isMobile}
          >
            <IconButton
              icon={
                interval === 'once' ? (
                  <IoIosCheckmarkCircle />
                ) : (
                  <IoMdThumbsUp />
                )
              }
              bg={completed ? 'green.400' : pristineGoalBgColor}
              _hover={{
                bg: completed ? 'green.400' : pristineGoalBgColorHover,
              }}
              rounded='md'
              color={completed ? 'white' : 'gray.300'}
              w='30px'
              h='30px'
              p='5px'
              mr={2}
              minW='none'
              aria-label='Did it!'
              onClick={() => onToggle(goal)}
            />
          </Tooltip>
        </Flex>
      )}
    </Flex>
  )
}

export default CommitmentListItem
