import { Flex, Text } from '@chakra-ui/react'
import moment from 'moment'
import { Entry } from 'types/Entry'

type Props = {
  entry: Entry
}
const JournalListViewDraftItem = ({ entry }: Props) => (
  <Flex direction='column' gap={1}>
    <Text fontWeight={500} fontSize='15px' noOfLines={1} wordBreak='break-all'>
      {entry.questions?.[0].response ?? 'Untitled'}
    </Text>
    <Flex gap={4}>
      <Text fontSize='12px' noOfLines={1} variant='tertiary'>
        {moment(entry.date).fromNow()}
      </Text>
    </Flex>
  </Flex>
)

export default JournalListViewDraftItem
