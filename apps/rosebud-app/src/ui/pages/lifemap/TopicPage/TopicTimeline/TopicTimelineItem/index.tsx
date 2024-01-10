import { Spinner, Flex, Heading, Box, Text } from '@chakra-ui/react'
import moment from 'moment'
import { CollectionItemMilestone } from 'types/Collection'
import Panel from 'ui/core/Panel'

type Props = {
  milestone: CollectionItemMilestone
}

const MilestoneItem = ({ milestone }: Props) => (
  <Panel>
    {!milestone.content ? (
      <Spinner size='md' color='brandGray.500' />
    ) : (
      <Flex>
        <Box mr={4}>
          <Heading fontSize='24px'>{milestone.emoji}</Heading>
        </Box>
        <Box>
          <Text color='brandGray.500'>
            {moment(milestone.metadata?.day).format('MMMM Do, YYYY')}
          </Text>
          <Text>{milestone.content}</Text>
        </Box>
      </Flex>
    )}
  </Panel>
)

export default MilestoneItem
