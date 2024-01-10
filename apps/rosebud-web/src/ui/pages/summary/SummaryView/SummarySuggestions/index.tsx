import { Box, Flex, IconButton, useToast } from '@chakra-ui/react'
import { captureException } from '@sentry/nextjs'
import { AnimatePresence } from 'framer-motion'
import Analytics from 'lib/analytics'
import { useNavigationProvider } from 'providers/NavigationProvider'
import { useSummaryProvider } from 'providers/SummaryProvider'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  CollectionItemGoal,
  CollectionItemGoalInterval,
} from 'types/Collection'
import MakeToast from 'ui/core/MakeToast'
import TopBar from 'ui/global/TopBar'
import { RbRegenerate } from 'ui/shared/Icon'
import AddEditGoalModal from 'ui/shared/modals/AddEditGoal'
import SummaryBottomBar from '../SummaryBottomBar'
import SummarySuggestion from './SummarySuggestion'

// original title is tracked because user can modify the goal title in the process
// of adding it to their recipe.
type GoalToBe = Partial<CollectionItemGoal> & { originalTitle: string }

type Props = {
  title: string
}

const SummarySuggestions = ({ title }: Props) => {
  const {
    suggestions,
    fetchSuggestions,
    suggestionsStreaming,
    addGoal,
    removeGoal,
  } = useSummaryProvider()
  const { popView } = useNavigationProvider()
  const initializedRef = useRef(false)
  const toast = useToast()

  const [goalToAdd, setGoalToAdd] = useState<GoalToBe>()
  const [addedGoals, setAddedGoals] = useState<GoalToBe[]>([])
  const [isAddModalOpen, setAddModalOpen] = useState(false)
  const [isAddModalWorking, setAddModalWorking] = useState(false)

  /**
   * Fetch suggestions on mount
   */
  useEffect(() => {
    if (initializedRef.current) return
    fetchSuggestions()
    initializedRef.current = true
    Analytics.trackEvent('summary.suggestions.view')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (goalToAdd) setAddModalOpen(true)
  }, [goalToAdd])

  const handleSelectGoal = (
    title: string,
    description: string,
    interval: CollectionItemGoalInterval,
    completionsRequired: number
  ) => {
    const goal: GoalToBe = {
      title,
      originalTitle: title,
      description,
      metadata: {
        interval,
        completionsRequired,
      },
    }

    setGoalToAdd(goal)
  }

  /**
   * Add a goal
   */
  const handleAddGoal = async (
    goalAsSubmitted: Partial<CollectionItemGoal>
  ) => {
    if (!goalToAdd || !goalAsSubmitted.metadata) {
      captureException(
        `Error adding a happiness recipe goal from a suggestion. Suggestion: ${goalToAdd}. Goal submitted by form: ${goalAsSubmitted}`
      )
      return
    }

    setAddModalWorking(true)

    // original title is to track what suggested goals have already been added.
    // have to break it out because the user can edit the title before they submit.
    const originalTitle = goalToAdd.originalTitle

    const { title = '', description = '', metadata } = goalAsSubmitted
    const { interval, completionsRequired } = metadata

    // the completions required rate means nothing for forever and once - set to 0.
    const effectiveCompletions = interval === 'weekly' ? completionsRequired : 0

    try {
      const goalId = await addGoal(
        title,
        description,
        interval,
        effectiveCompletions
      )

      setAddModalOpen(false)

      setAddedGoals((prev) => [
        ...prev,
        {
          id: goalId,
          title,
          description,
          originalTitle,
        },
      ])

      toast(
        MakeToast({
          title: 'Added to happiness recipe',
        })
      )
    } catch {
      toast(
        MakeToast({
          title: 'Unable to add suggestion to your happiness recipe.',
          status: 'error',
        })
      )
    }

    setAddModalWorking(false)
  }

  /**
   * Remove a goal
   */
  const handleRemoveGoal = useCallback(
    async (goalId: string) => {
      const goal = addedGoals.find((goal) => goal.id === goalId)

      if (goal) {
        removeGoal(goalId, goal.title ?? '')
      }

      setAddedGoals((prev) => {
        const index = prev.findIndex((goal) => goal.id === goalId)
        if (index === -1) return prev
        return [...prev.slice(0, index), ...prev.slice(index + 1)]
      })

      toast(
        MakeToast({
          title: 'Removed from happiness recipe',
        })
      )
    },
    [addedGoals, removeGoal, toast]
  )

  return (
    <>
      <Box h='100%'>
        <TopBar
          title={title}
          overlayEffect
          rightAction={
            <IconButton
              icon={<RbRegenerate boxSize='18px' />}
              aria-label='regenerate'
              variant='ghost'
              onClick={() => fetchSuggestions(true)}
              isLoading={suggestionsStreaming}
            />
          }
        />

        <AnimatePresence>
          <Flex direction='column' gap={2} p={2} pb='100px'>
            {suggestions?.map((suggestion, i) => {
              // Don't show the card until the title's there and the desc begins appearing
              if (!suggestion.title || !suggestion.description) return null

              let { title, description } = suggestion
              const { metadata } = suggestion
              const interval = metadata?.interval ?? undefined
              let completionsRequired = metadata?.completionsRequired ?? 0

              // in case OpenAI hallucinates and doesn't provide a valid completion range
              if (
                interval === 'weekly' &&
                (completionsRequired < 1 || completionsRequired > 7)
              ) {
                completionsRequired = Math.min(
                  Math.max(1, completionsRequired),
                  7
                )
              }

              // If it's been added as a goal...
              const addedGoal = addedGoals.find(
                (goal) => goal.originalTitle === title
              )

              if (addedGoal) {
                // if user added this suggestion as a goal, they may have updated the title or desc
                if (addedGoal.title) title = addedGoal.title
                if (addedGoal.description) description = addedGoal.description
              }

              return (
                <SummarySuggestion
                  key={i}
                  interval={interval}
                  completionsRequired={completionsRequired}
                  title={title}
                  description={description}
                  goalId={addedGoal?.id}
                  onAdd={handleSelectGoal}
                  onRemove={handleRemoveGoal}
                  showTip={!suggestionsStreaming && i === 0}
                />
              )
            })}
          </Flex>
        </AnimatePresence>

        <SummaryBottomBar onClick={() => popView()}>Done</SummaryBottomBar>
      </Box>

      <AddEditGoalModal
        mode='add'
        goal={goalToAdd}
        isOpen={isAddModalOpen}
        isWorking={isAddModalWorking}
        onAdd={handleAddGoal}
        onClose={() => {
          setAddModalOpen(false)
          setGoalToAdd(undefined)
        }}
      />
    </>
  )
}

export default SummarySuggestions
