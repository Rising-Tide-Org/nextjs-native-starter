import { Box, Text, Icon, BoxProps } from '@chakra-ui/react'
import Analytics from 'lib/analytics'
import { useMemo } from 'react'
import { BiErrorCircle } from 'react-icons/bi'

type Props = BoxProps & {
  error?: Error | string | null
}

const FormGenericError = ({ error, ...props }: Props) => {
  const parsedError = useMemo(() => {
    if (!error) return null

    if (typeof error === 'string') {
      return error
    }

    if (error instanceof Error) {
      return error.message
    }

    // TODO, take a look in Mixpanel at some point if it ever been dispatched
    // This ideally would never trigger
    Analytics.trackEvent('form.generic.error', {
      error: error,
      errorType: typeof error,
    })

    return 'Something went wrong'
  }, [error])

  if (!error) {
    return null
  }

  return (
    <Box px={4} pb={5} mb={4} {...props}>
      <Text
        color='red.500'
        display='flex'
        alignItems='center'
        gap={2}
        lineHeight='1'
      >
        <Icon w={5} h={5} as={BiErrorCircle} /> {parsedError}
      </Text>
    </Box>
  )
}

export default FormGenericError
