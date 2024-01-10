import {
  Button,
  ButtonGroup,
  Divider,
  Flex,
  Spinner,
  Text,
} from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { Entry } from 'types/Entry'
import { ucFirst, removeTrailingNumber, splitNumberedList } from 'util/string'

const PostSaveAffirmations = ({ entry }: { entry: Entry }) => {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [response, setResponse] = useState<string>()
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!initializedRef.current) {
      handleSuggestions()
      initializedRef.current = true
    }
  }, [entry])

  useEffect(() => {
    if (response) {
      if (response.includes('1.')) {
        const resp = response.split('1.')[1]
        setSuggestions(splitNumberedList('1. ' + resp))
      }
    }
  }, [response])

  const handleSuggestions = async () => {
    setResponse('')
    const response = await fetch('/api/entryAffirmations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ entries: [entry] }),
    })

    if (!response.ok) {
      throw new Error(response.statusText)
    }

    // This data is a ReadableStream
    const data = response.body
    if (!data) {
      return
    }

    const reader = data.getReader()
    const decoder = new TextDecoder()
    let done = false

    while (!done) {
      const { value, done: doneReading } = await reader.read()
      done = doneReading
      const chunkValue = decoder.decode(value)
      setResponse((prev) => prev + chunkValue)
    }
  }

  return (
    <Flex direction='column' gap={3} p={4} w='full'>
      {suggestions.length > 0 ? (
        suggestions.map((suggestion, i) => {
          return (
            <Flex
              key={i}
              bg='brandGray.100'
              border='1px solid'
              borderColor='brandGray.300'
              rounded='md'
              direction='column'
              w='full'
            >
              <Text p={3} fontWeight={500}>
                {ucFirst(removeTrailingNumber(suggestion))}
              </Text>
              <Divider />
              <ButtonGroup size='sm' variant='ghost' my={2} ml={1}>
                <Button color='brand.500' fontSize='15px' fontWeight={500}>
                  Save
                </Button>
              </ButtonGroup>
            </Flex>
          )
        })
      ) : (
        <Flex p={4}>
          <Spinner size='sm' />
        </Flex>
      )}
    </Flex>
  )
}

export default PostSaveAffirmations
