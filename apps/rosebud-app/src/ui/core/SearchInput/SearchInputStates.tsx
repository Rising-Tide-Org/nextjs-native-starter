import React from 'react'
import { Button, Flex, Spinner, Text } from '@chakra-ui/react'
import { BsArrowClockwise } from 'react-icons/bs'

type Props = {
  error?: string
  emptyLabel?: string
  isLoading?: boolean
  isEmpty?: boolean
  onSearchRepeat?: () => void
}

const SearchInputStates = ({
  error,
  emptyLabel,
  isLoading,
  isEmpty,
  onSearchRepeat,
}: Props) => {
  if (isLoading) {
    return (
      <Flex alignItems='center' pt={8} flexDir='column' gap={4}>
        <Spinner size='md' />
      </Flex>
    )
  }

  if (error) {
    return (
      <Flex alignItems='center' pt={8} flexDir='column' gap={4}>
        <Text color='brand.500' textAlign='center' w='full'>
          {error}
        </Text>
        <Button
          onClick={onSearchRepeat}
          variant='primary'
          size='sm'
          leftIcon={<BsArrowClockwise />}
        >
          Reload
        </Button>
      </Flex>
    )
  }

  if (isEmpty) {
    return (
      <Flex alignItems='center' pt={8} flexDir='column' gap={4}>
        <Text textAlign='center' w='full' variant='tertiary'>
          {emptyLabel}
        </Text>
      </Flex>
    )
  }

  return null
}

export default SearchInputStates
