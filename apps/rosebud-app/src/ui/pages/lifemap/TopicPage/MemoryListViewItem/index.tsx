import { BoxProps, Flex, Text } from '@chakra-ui/react'
import moment from 'moment'
import { Entry } from 'types/Entry'

type Props = BoxProps & {
  entry: Entry
}
const MemoryListViewItem = ({ entry, ...props }: Props) => (
  <Flex direction='column' w='full' gap={2} {...props}>
    <Flex justifyContent='space-between' w='full' align='center' gap={1}>
      <Text fontWeight={500} fontSize='16px' noOfLines={2}>
        {entry.summary?.title ?? 'Untitled'}
      </Text>
      <Text
        fontSize='15px'
        color='brandGray.500'
        css={{
          fontVariantNumeric: 'lining-nums',
        }}
        flexShrink={0}
      >
        {moment(entry.day).format('MMM D')}
      </Text>
    </Flex>
  </Flex>
)

export default MemoryListViewItem
