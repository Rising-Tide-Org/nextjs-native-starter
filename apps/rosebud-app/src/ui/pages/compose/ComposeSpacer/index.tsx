import { Box } from '@chakra-ui/react'
import { useComposeProvider } from 'providers/ComposeProvider'
import { useComposeCoordinator } from '../ComposeCoordinator'

const ComposeSpacer = () => {
  const { activeResponse } = useComposeProvider()
  const { textAreaRef } = useComposeCoordinator()
  return (
    <Box
      h='100vh'
      onClick={() =>
        activeResponse?.prompt.input === 'text' && textAreaRef?.current?.focus()
      }
    />
  )
}

export default ComposeSpacer
