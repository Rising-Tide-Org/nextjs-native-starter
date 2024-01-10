import { Flex, Text } from '@chakra-ui/react'
import moment from 'moment'
import { Entry } from 'types/Entry'

type Props = {
  entry: Entry
}
const JournalListViewItem = ({ entry }: Props) => (
  <Flex>
    <Flex
      direction='column'
      justify='top'
      align='end'
      mr={3}
      rounded='md'
      w='24px'
      flexShrink={0}
      gap={0}
      pt={1}
    >
      <Text
        variant={'tertiary'}
        fontSize='10px'
        fontWeight={500}
        textTransform='uppercase'
        h='10px'
      >
        {moment(entry.day).format('ddd')}
      </Text>
    </Flex>
    <Text fontWeight={500} fontSize='15px' noOfLines={2}>
      {entry.summary?.title ?? 'Untitled'}
    </Text>
  </Flex>
)

export default JournalListViewItem
