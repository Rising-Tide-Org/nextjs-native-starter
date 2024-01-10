import { Box, Input, Text } from '@chakra-ui/react'
import { useState } from 'react'

type Props = {
  onChange: (value: string) => void
}

const kNameMinLength = 3

const NameInput = ({ onChange }: Props) => {
  const [error, setError] = useState<string | null>(null)

  const handleNameChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    showError = false
  ) => {
    const value = e.target.value
    if (!value) {
      onChange('')
      setError(null)
      return
    }
    if (value.length < kNameMinLength) {
      onChange('')
      if (showError) {
        setError('Name must be at least 3 characters')
      }
      return
    }

    setError(null)
    onChange(value)
  }

  return (
    <Box w='full'>
      <Input
        name='name'
        autoComplete='new-password'
        isInvalid={Boolean(error)}
        size='lg'
        p={2}
        minLength={kNameMinLength}
        placeholder='Your name'
        onBlur={(e) => handleNameChange(e, true)}
        onChange={handleNameChange}
      />
      {error && (
        <Text color='red.500' px={2} pt={2}>
          {error}
        </Text>
      )}
    </Box>
  )
}

export default NameInput
