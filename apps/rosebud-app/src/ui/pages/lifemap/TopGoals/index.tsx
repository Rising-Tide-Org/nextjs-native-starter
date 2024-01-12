import { Flex, Text } from '@chakra-ui/react'
import { query, where } from 'firebase/firestore'
import useFetchMany from 'shared/hooks/useFetchMany'
import { ListView } from 'ui/core/ListView'
import { ListViewItem } from 'ui/core/ListView/ListViewItem'
import { CollectionItemGoal } from 'types/Collection'

const TopGoals = () => {
  const { data: goals } = useFetchMany<CollectionItemGoal>(
    'items',
    (q) => query(q, where('type', '==', 'goal')),
    {
      subscribe: true,
    }
  )

  // Filter out goals that have only been completed once
  const filteredGoals = goals?.filter(
    (goal) =>
      goal.metadata.completions && goal.metadata.completions?.length >= 1
  )

  // Sort goals by number of completions
  const sortedGoals = filteredGoals?.sort(
    (a, b) =>
      (b.metadata.completions?.length || 0) -
      (a.metadata.completions?.length || 0)
  )

  if (!sortedGoals?.length) {
    return null
  }

  return (
    <Flex direction='column' w='full'>
      <Text fontSize='xl' fontWeight='bold' pt={9} pb={6}>
        Top goals
      </Text>
      <ListView border='1px solid' borderColor='border'>
        {sortedGoals?.slice(0, 5).map((goal) => (
          <ListViewItem key={goal.id} cursor='default'>
            <Flex justify='space-between' w='full'>
              <Text>{goal.title}</Text>
              <Text>
                {goal.metadata.completions?.length || 0}{' '}
                {goal.metadata.completions?.length === 1 ? 'time' : 'times'}
              </Text>
            </Flex>
          </ListViewItem>
        ))}
      </ListView>
    </Flex>
  )
}

export default TopGoals
