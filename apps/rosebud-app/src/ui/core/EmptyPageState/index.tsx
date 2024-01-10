import { VStack, Box, Text, Heading, BoxProps } from '@chakra-ui/react'
import { ReactNode } from 'react'
import Panel from '../Panel'

type Props = BoxProps & {
  icon?: string | ReactNode
  label?: string
  header?: string
  beforeElement?: ReactNode
  afterElement?: ReactNode
}

const EmptyPageState = ({
  label,
  icon,
  header,
  beforeElement,
  afterElement,
  ...props
}: Props) => {
  return (
    <Box w='full'>
      {beforeElement}
      <Panel {...props}>
        <VStack w='100%' spacing={6} py={12}>
          {icon ? <Heading mt={3}>{icon}</Heading> : null}
          {header ? (
            <Heading fontSize='xl' maxW='340px' textAlign='center'>
              {header}
            </Heading>
          ) : null}
          {label ? (
            <Text
              fontSize='md'
              variant='tertiary'
              m='0 auto'
              maxW='300px'
              textAlign='center'
            >
              {label}
            </Text>
          ) : null}
          {afterElement}
        </VStack>
      </Panel>
    </Box>
  )
}

export default EmptyPageState
