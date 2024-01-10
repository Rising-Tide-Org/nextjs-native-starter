import {
  Button,
  Flex,
  Text,
  useColorMode,
  useToast,
  VStack,
  Icon,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react'
import { Timestamp } from 'firebase/firestore'
import { useGoalsProvider } from 'providers/GoalsProvider'
import { useCallback, useEffect, useState } from 'react'
import { FaChevronDown } from 'react-icons/fa'
import { CollectionItemGoal } from 'types/Collection'
import MakeToast from 'ui/core/MakeToast'
import Panel from 'ui/core/Panel'
import SmallCapsHeading from 'ui/core/SmallCapsHeading'
import { RbPlus } from 'ui/shared/Icon'
import AddEditGoalModal from 'ui/shared/modals/AddEditGoal'
import { getGoalsByCompletion, isGoalCompleted } from 'util/goals'
import CommitmentListItem from './item'

const kConfirmationStrings = [
  'Nice job!',
  'Well done!',
  'Good work!',
  'Keep it up!',
]

const CommitmentList = () => {
  const {
    goals,
    addGoal,
    updateGoal,
    completeGoal,
    unCompleteGoal,
    deleteGoal,
  } = useGoalsProvider()
  const toast = useToast()
  const { colorMode } = useColorMode()

  const [isEditing, setIsEditing] = useState(false)
  const [isAddModalOpen, setAddModalOpen] = useState(false)
  const [isAddModalWorking, setAddModalWorking] = useState(false)
  const [addEditMode, setAddEditMode] = useState<'add' | 'edit'>('add')
  // set to null when adding a new goal
  const [goalToEdit, setGoalToEdit] = useState<CollectionItemGoal | null>()
  const [isCompletedExpanded, setCompletedExpanded] = useState(false)

  const hoverBgColor = useColorModeValue('brandGray.50', 'brandGray.750')

  const isDarkMode = colorMode === 'dark'

  useEffect(() => {
    if (goalToEdit || goalToEdit === null) {
      setAddEditMode(goalToEdit ? 'edit' : 'add')
      setAddModalOpen(true)
    }
  }, [goalToEdit])

  const onClickAddGoal = useCallback(() => {
    // triggers opening the modal with no goal data
    setGoalToEdit(null)
  }, [])

  const handleAddGoal = async (
    goalAsSubmitted: Partial<CollectionItemGoal>
  ) => {
    if (!goalAsSubmitted.metadata) {
      return
    }

    setAddModalWorking(true)

    const { title, description, metadata } = goalAsSubmitted
    const { interval, completionsRequired } = metadata

    const goal: CollectionItemGoal = {
      type: 'goal',
      title,
      description,
      createdAt: Timestamp.now(),
      metadata: {
        interval,
        completionsRequired,
        completions: [],
      },
    }

    try {
      await addGoal(goal)

      setAddModalOpen(false)
      setGoalToEdit(undefined)

      toast(
        MakeToast({
          title: 'Added to happiness recipe',
        })
      )
    } catch (e) {
      toast(
        MakeToast({
          title: 'Unable to add ingredient. Please try again later.',
          status: 'error',
        })
      )
    }

    setAddModalWorking(false)
  }

  const handleEditGoal = async (goal: CollectionItemGoal) => {
    if (!goal.metadata || !goal.id) {
      console.error('something is up')
      return
    }

    setAddModalWorking(true)

    goal.updatedAt = Timestamp.now()

    try {
      await updateGoal(goal.id, goal)

      setAddModalOpen(false)
      setGoalToEdit(undefined)

      toast(
        MakeToast({
          title: 'Happiness recipe updated',
        })
      )
    } catch {
      toast(
        MakeToast({
          title: 'Unable to update recipe. Please try again later.',
          status: 'error',
        })
      )
    }

    setAddModalWorking(false)
  }

  const onClickEdit = useCallback((goal: CollectionItemGoal) => {
    setGoalToEdit(goal)
  }, [])

  /**
   * Mark a goal complete
   */
  const handleCompleteGoal = useCallback(
    (goalId: string) => {
      completeGoal(goalId).then((success) => {
        if (success) {
          toast(
            MakeToast({
              title: kConfirmationStrings[Math.floor(Math.random() * 4)],
              status: 'success',
            })
          )
        } else {
          toast(
            MakeToast({
              title: 'Already completed today :)',
              status: 'error',
            })
          )
        }
      })
    },
    [completeGoal, toast]
  )

  /**
   * Toggle a goal completion
   */
  const handleCompletionToggle = useCallback(
    (goal: CollectionItemGoal) => {
      if (goal.id == null) return

      const completed = isGoalCompleted(goal)

      if (completed) {
        unCompleteGoal(goal.id)
      } else {
        handleCompleteGoal(goal.id)
      }
    },
    [handleCompleteGoal, unCompleteGoal]
  )

  /**
   * Delete a goal
   */
  const handleDeleteGoal = useCallback(
    (goal: Partial<CollectionItemGoal>) => {
      if (window.confirm(`Remove ${goal.title}?`)) {
        // Ensure to not run goal delete if goal doesn't have an id
        if (goal.id == null) return

        deleteGoal(goal.id)
      }
    },
    [deleteGoal]
  )

  const handleToggleEdit = useCallback(() => {
    setIsEditing((prev) => !prev)
  }, [])

  if (!goals) return null

  const [incompleteGoals, completedGoals] = getGoalsByCompletion(goals)

  return (
    <>
      <Flex w='full' justify='space-between' align='center' mb={2}>
        <SmallCapsHeading>Happiness recipe</SmallCapsHeading>
        {goals?.length ? (
          <Button
            size='xs'
            variant='ghost'
            textColor='gray.300'
            onClick={handleToggleEdit}
            mt='-8px'
          >
            {isEditing ? 'Done' : 'Edit'}
          </Button>
        ) : null}
      </Flex>
      <Panel
        variant={isDarkMode ? undefined : 'primaryVStack'}
        p={0}
        w='full'
        overflow='hidden'
      >
        {!goals?.length ? (
          <VStack
            align='center'
            justifyContent='center'
            w='100%'
            height={248}
            spacing={4}
          >
            <Text
              fontSize='md'
              variant='tertiary'
              textAlign='center'
              maxW='280px'
            >
              Build your recipe now or by adding suggestions after writing an
              entry.
            </Text>
            <Button variant='secondary' onClick={onClickAddGoal}>
              <RbPlus />
              Add Ingredient
            </Button>
          </VStack>
        ) : (
          <>
            <VStack align='start' w='100%' spacing={0} position='relative'>
              {incompleteGoals.map((goal, index) => (
                <CommitmentListItem
                  goal={goal}
                  key={index}
                  onToggle={handleCompletionToggle}
                  onDelete={handleDeleteGoal}
                  onEdit={onClickEdit}
                  isEditing={isEditing}
                />
              ))}

              <Flex
                direction='row'
                w='100%'
                justifyContent='center'
                align='center'
                textAlign='center'
                p={2}
                cursor='pointer'
                _hover={{ backgroundColor: hoverBgColor }}
                onClick={onClickAddGoal}
              >
                <RbPlus color='brandGray.500' />
                <SmallCapsHeading my={0} fontWeight={600} color='brandGray.600'>
                  Add Ingredient
                </SmallCapsHeading>
              </Flex>
            </VStack>
          </>
        )}
      </Panel>

      {completedGoals.length > 0 && (
        <Panel
          variant={isDarkMode ? undefined : 'primaryVStack'}
          p={0}
          mt={2}
          w='full'
          overflow='hidden'
        >
          <VStack align='start' w='100%' spacing={0} position='relative'>
            <Flex
              justifyContent='space-between'
              alignItems='center'
              w='100%'
              py={3}
              px={3}
              cursor='pointer'
              onClick={() => setCompletedExpanded(!isCompletedExpanded)}
            >
              <SmallCapsHeading fontWeight={600} m={0}>
                Completed ({completedGoals.length})
              </SmallCapsHeading>
              <Icon
                size={4}
                as={FaChevronDown}
                color='brandGray.500'
                transform={isCompletedExpanded ? 'rotate(180deg)' : ''}
              />
            </Flex>
            {isCompletedExpanded ? <Divider /> : null}
            {isCompletedExpanded &&
              completedGoals.map((goal, index) => (
                <CommitmentListItem
                  goal={goal}
                  key={index}
                  isEditing={isEditing}
                  onToggle={handleCompletionToggle}
                  onDelete={handleDeleteGoal}
                />
              ))}
          </VStack>
        </Panel>
      )}

      <AddEditGoalModal
        mode={addEditMode}
        goal={goalToEdit}
        isOpen={isAddModalOpen}
        isWorking={isAddModalWorking}
        onAdd={handleAddGoal}
        onEdit={handleEditGoal}
        onClose={() => {
          setAddModalOpen(false)
          setGoalToEdit(undefined)
        }}
        onDelete={(goal) => {
          setAddModalOpen(false)
          handleDeleteGoal(goal)
        }}
      />
    </>
  )
}

export default CommitmentList
