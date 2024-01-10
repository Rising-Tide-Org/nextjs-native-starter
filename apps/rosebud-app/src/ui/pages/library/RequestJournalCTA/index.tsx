import { Text, Flex, Button, Link, Spacer } from '@chakra-ui/react'
import Panel from 'ui/core/Panel'
import SmallCapsHeading from 'ui/core/SmallCapsHeading'

const RequestJournalCTA = () => {
  return (
    <Panel variant='vstack' textAlign='center' m='0 auto' h='full'>
      <SmallCapsHeading>Submit an idea</SmallCapsHeading>
      <Spacer />
      <Text textAlign='center' pb={4}>
        Want to see a new guided journal on Rosebud?
      </Text>
      <Spacer />
      <Flex direction='column' gap={2}>
        <Link
          href='https://airtable.com/appV8tOon3RZzy4aI/shrjobUSjGqrwHsUW'
          isExternal
        >
          <Button variant='solid' size='sm'>
            Suggest a journal
          </Button>
        </Link>
      </Flex>
    </Panel>
  )
}

export default RequestJournalCTA
