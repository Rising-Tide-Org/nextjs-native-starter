import { Box, HStack, VStack, Text, Button } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { RbStarFill, RbStarStroke } from 'ui/shared/Icon'
import JiggleBox from 'ui/shared/JiggleBox'

type Props = {
  onSubmit: (value: number) => void
  onChange: (value: number) => void
}

const StarRatingInput = ({ onSubmit, onChange }: Props) => {
  const [savedValue, setSavedValue] = useState(0)
  const [hoverValue, setHoverValue] = useState(0)

  const flavorText = useMemo(() => {
    const value = hoverValue || savedValue
    switch (value) {
      case 1:
        return 'Poor'
      case 2:
        return 'Could be better'
      case 3:
        return "It's okay"
      case 4:
        return 'Pretty good'
      case 5:
        return 'Amazing!'
    }
  }, [hoverValue, savedValue])

  const starColor = useMemo(() => {
    const value = hoverValue || savedValue
    switch (value) {
      case 1:
        return 'red.300'
      case 2:
        return 'gold.400'
      case 3:
        return 'gold.500'
      case 4:
        return 'gold.600'
      case 5:
        return 'yellow.800'
    }
  }, [hoverValue, savedValue])

  const handleClick = (value: number) => {
    setSavedValue(value)
    onChange(value)
  }

  return (
    <VStack spacing={4}>
      <HStack w='full' justify='center' onMouseLeave={() => setHoverValue(0)}>
        {Array.from(Array(5)).map((_, index) => (
          <Box
            onMouseOver={() => setHoverValue(index + 1)}
            onClick={() => handleClick(index + 1)}
            key={index}
            cursor='pointer'
          >
            <JiggleBox>
              {(hoverValue > 0 && hoverValue >= index + 1) ||
              (!hoverValue && savedValue > 0 && savedValue >= index + 1) ? (
                <RbStarFill
                  boxSize='40px'
                  color={starColor}
                  transition='all 0.2s linear'
                />
              ) : (
                <RbStarStroke boxSize='40px' color='brandGray.300' />
              )}
            </JiggleBox>
          </Box>
        ))}
      </HStack>
      <Box h='24px'>
        <Text
          fontSize='sm'
          color='brandGray.500'
          visibility={hoverValue > 0 || savedValue > 0 ? 'visible' : 'hidden'}
        >
          {flavorText}
        </Text>
      </Box>
      <Button
        variant='primary'
        w='120px'
        onClick={() => onSubmit(savedValue)}
        isDisabled={savedValue === 0}
      >
        Submit
      </Button>
    </VStack>
  )
}

export default StarRatingInput
