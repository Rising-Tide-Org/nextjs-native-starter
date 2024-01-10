import { VStack, Text, Button } from '@chakra-ui/react'
import routes from 'lib/routes'
import ListViewHeading from 'ui/core/ListView/ListViewHeading'
import Panel from 'ui/core/Panel'
import { RbPencil } from 'ui/shared/Icon'
import NextLink from 'next/link'

const JournalEmptyListView = () => (
  <VStack align='start'>
    <ListViewHeading>This week</ListViewHeading>
    <Panel w='full'>
      <VStack px={{ base: 2, md: 1 }} align='start' spacing={4}>
        <Text>Your entries will show up here.</Text>
        <NextLink href={routes.compose()}>
          <Button variant='primary' leftIcon={<RbPencil boxSize='16px' />}>
            Write first entry
          </Button>
        </NextLink>
      </VStack>
    </Panel>
  </VStack>
)

export default JournalEmptyListView
