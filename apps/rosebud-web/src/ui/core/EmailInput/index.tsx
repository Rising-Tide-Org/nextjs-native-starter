import { Box, Input, InputProps } from '@chakra-ui/react'
import { kEmailMinLength } from 'util/form'

const EmailEntry = (props: InputProps) => {
  return (
    <Box w='full'>
      <Input
        name='email'
        type='email'
        autoComplete='email'
        size='lg'
        p={2}
        pl={3}
        minLength={kEmailMinLength}
        placeholder='Email address'
        data-testid='email-input'
        {...props}
      />
    </Box>
  )
}

export default EmailEntry
