import { Flex, Box, useColorMode } from '@chakra-ui/react'
import { useComposeProvider } from 'providers/ComposeProvider'

const ComposeLoader = () => {
  const { colorMode } = useColorMode()
  const { isLoading } = useComposeProvider()

  if (!isLoading) return null

  return (
    <Flex px={4} mt='2px'>
      <Box
        className={
          colorMode === 'dark'
            ? 'dot-flashing-animation-dark'
            : 'dot-flashing-animation'
        }
      ></Box>
    </Flex>
  )
}

export default ComposeLoader
