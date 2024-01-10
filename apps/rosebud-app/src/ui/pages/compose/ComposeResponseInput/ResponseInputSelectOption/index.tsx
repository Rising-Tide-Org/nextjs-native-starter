import { useEffect, useState } from 'react'
import {
  Box,
  BoxProps,
  Input,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react'
import { RbCheckmark } from 'ui/shared/Icon'

type Props = BoxProps & {
  selected: boolean
  isOther?: boolean
  otherValue?: string
  onChoose: (value: string) => void
}

const ResponseInputSelectOption = ({
  children,
  selected,
  isOther = false,
  otherValue = '',
  onChoose,
  ...props
}: Props) => {
  const bgColorSelected = useColorModeValue('gray.50', 'gray.900')
  const borderColorSelected = useColorModeValue('blue.200', 'blue.700')
  const borderColorHover = useColorModeValue('brandGray.300', 'gray.500')
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState(otherValue)

  useEffect(() => {
    setInputValue(otherValue)
  }, [otherValue])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.substring(0, 30)
    setInputValue(value)
    if (value === '') {
      onChoose(value)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onChoose(inputValue)
      setIsEditing(false)
    }
  }

  return (
    <Box
      border='1px solid'
      borderColor={selected ? borderColorSelected : 'inherit'}
      px={3}
      py={2}
      rounded='md'
      fontWeight={500}
      w='fit-content'
      fontSize='15px'
      bg={selected ? bgColorSelected : 'bg'}
      cursor='pointer'
      _hover={{
        base: {},
        md: {
          borderColor: selected ? 'blue' : borderColorHover,
        },
      }}
      onClick={() => {
        onChoose(inputValue)
        if (isOther) {
          setIsEditing(true)
        }
      }}
      {...props}
    >
      {isEditing ? (
        <Box display='flex' alignItems='center' position='relative'>
          <Input
            variant='unstyled'
            placeholder='Write your answer'
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onBlur={() => {
              setIsEditing(false)
              onChoose(inputValue)
            }}
            size='sm'
            w='240px'
            fontSize='15px'
            fontWeight={500}
            autoFocus
            mr={3}
          />
          <IconButton
            aria-label='Done'
            variant='primary'
            icon={<RbCheckmark boxSize='16px' />}
            size='xs'
            height='100%'
            position='absolute'
            right={0}
          />
        </Box>
      ) : (
        <>{isOther && inputValue === '' ? children : inputValue || children}</>
      )}
    </Box>
  )
}

export default ResponseInputSelectOption
