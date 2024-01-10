import { VStack, Text, Button, Flex } from '@chakra-ui/react'
import routes from 'lib/routes'
import Panel from 'ui/core/Panel'
import { RbPencil } from 'ui/shared/Icon'
import NextLink from 'next/link'

type Props = {
  entriesCount: number
}

const EmptyLifemapPage = ({ entriesCount }: Props) => {
  let message = 'Your yearly review will show up here.'

  if (entriesCount < 3) {
    message = 'Write at least 3 entries to see your yearly review.'
  } else {
    message =
      'Write a few more entries with common topics to generate your yearly review.'
  }

  return (
    <Flex alignItems='center' justify='center' width='full'>
      <Panel mt={8}>
        <VStack spacing={4} p={4}>
          <Text textAlign='center'>{message}</Text>
          <NextLink href={routes.compose()}>
            <Button variant='primary' leftIcon={<RbPencil boxSize='16px' />}>
              Write new entry
            </Button>
          </NextLink>
        </VStack>
      </Panel>
    </Flex>
  )
}

export default EmptyLifemapPage
