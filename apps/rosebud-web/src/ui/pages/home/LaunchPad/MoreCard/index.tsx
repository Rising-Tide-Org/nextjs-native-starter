import { Text, Flex, Button, Link, Spacer } from '@chakra-ui/react'
import Panel from 'ui/core/Panel'
import NextLink from 'next/link'
import routes from 'lib/routes'
import { ShareInBoxIllustration } from 'ui/shared/Illustration'

const MoreCard = () => {
  return (
    <Panel
      variant='vstack'
      textAlign='center'
      m='0 auto'
      h='full'
      w='240px'
      alignItems='center'
    >
      <Spacer />
      <ShareInBoxIllustration />
      <Spacer />
      <Text textAlign='center' pb={4}>
        Discover more guided journals and personalized prompts.
      </Text>
      <Spacer />
      <Flex direction='column' gap={2}>
        <Link as={NextLink} href={routes.library} shallow passHref>
          <Button variant='solid' size='md'>
            Explore &rarr;
          </Button>
        </Link>
      </Flex>
    </Panel>
  )
}

export default MoreCard
