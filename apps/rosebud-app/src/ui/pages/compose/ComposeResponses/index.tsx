import { Flex, Box, Text } from '@chakra-ui/react'
import { useComposeProvider } from 'providers/ComposeProvider'
import { useComposeCoordinator } from '../ComposeCoordinator'
import PromptLabel from '../PromptLabel'

const ComposeResponses = () => {
  const { responses } = useComposeProvider()
  const { responseRefs } = useComposeCoordinator()

  return (
    <>
      {responses.map((response, i) => {
        const responseText = response.response.join('\n')
        return (
          <Flex direction='column' key={response.prompt.content[0]}>
            <Flex direction='column' gap={2}>
              {response.prompt.content.map((prompt, i) => (
                <PromptLabel key={i}>{prompt}</PromptLabel>
              ))}
            </Flex>
            {responseText ? (
              <Box ref={responseRefs[i]} pt={4}>
                <Text
                  fontSize='17px'
                  lineHeight={1.37}
                  whiteSpace='pre-wrap'
                  data-sentry-block
                  data-testid={`prompt-response-${i}`}
                >
                  {responseText}
                </Text>
              </Box>
            ) : (
              <Box ref={responseRefs[i]} />
            )}
          </Flex>
        )
      })}
    </>
  )
}

export default ComposeResponses
