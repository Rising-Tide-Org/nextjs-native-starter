import { Spinner, Text } from '@chakra-ui/react'
import Panel from 'ui/core/Panel'

type Props = {
  text?: string
}

const LoadingCard = ({ text = 'Loading...' }: Props) => (
  <Panel
    w='240px'
    h='full'
    fontSize='17px'
    fontWeight={500}
    variant='vstack'
    alignItems='center'
    justifyContent='center'
    gap={4}
  >
    <Spinner size='md' color='brandGray.500' />
    <Text fontWeight={450} variant='secondary' pb={4}>
      {text}
    </Text>
  </Panel>
)

export default LoadingCard
