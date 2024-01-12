import { useRef, useState, useEffect } from 'react'
import {
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  InputRightElement,
  Text,
  Box,
  ChakraProps,
  useColorModeValue,
} from '@chakra-ui/react'
import { IoIosClose } from 'react-icons/io'
import useKeyboardShortcut from 'shared/hooks/useShortcutKeyDown'
import { useRouter } from 'next/router'
import { useDebounce } from 'usehooks-ts'
import { RbSearch } from 'ui/shared/Icon'
import useIsMobile from 'shared/hooks/useIsMobile'
import Analytics from 'lib/analytics'

type SearchInputProps = {
  initialQuery?: string
  onQuery: (query: string) => void
} & ChakraProps

const SearchInput = ({ initialQuery, onQuery, ...props }: SearchInputProps) => {
  const [query, setQuery] = useState(initialQuery || '')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const debouncedQuery = useDebounce<string>(query, 250)
  const isMobile = useIsMobile()
  const iconButtonColor = useColorModeValue('gray.300', 'gray.500')
  const iconButtonColorHover = useColorModeValue('gray.500', 'gray.300')
  const shortcutShadowColor = useColorModeValue('#e7e7e7', '#8B807F')
  const shortcutBorderColor = useColorModeValue('gray.200', 'brandGray.500')

  useKeyboardShortcut(['/'], (e) => {
    if (inputRef.current) {
      if (inputRef.current !== document.activeElement) {
        Analytics.trackEvent('searchInput.focusShortcut')
      }
      inputRef.current.focus()
      e.preventDefault()
    }
  })

  /**
   * This effect is responsible for adding/removing the url query parameter
   * when the search query changes (e.g. ?q=foo)
   */
  useEffect(() => {
    const parsedQuery = debouncedQuery.trim()

    const urlParams = new URLSearchParams(window.location.search)
    const qParam = urlParams.get('q')

    if (qParam === parsedQuery) return

    if (parsedQuery) {
      router.query.q = parsedQuery
      router.replace(router, undefined, { shallow: true })
    } else {
      // Remove the 'q' query parameter if it exists
      if (urlParams.has('q')) {
        urlParams.delete('q')
        router.replace({ search: urlParams.toString() }, undefined, {
          shallow: true,
        })
      }
    }
    onQuery(parsedQuery)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery])

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawQuery = event.target.value
    setQuery(rawQuery)
  }

  const handleClearClick = () => {
    setQuery('')
    onQuery('')
  }

  return (
    <InputGroup {...props}>
      <InputLeftElement pointerEvents='none'>
        <RbSearch boxSize='16px' color='gray.300' />
      </InputLeftElement>
      <Input
        bg='bg'
        ref={inputRef}
        type='text'
        placeholder='Search'
        value={query}
        onChange={handleQueryChange}
      />
      {!query && !isMobile && (
        // Shortcut to focus the search input
        <InputRightElement>
          <Box
            width='16px'
            height='16px'
            border='1px solid'
            borderColor={shortcutBorderColor}
            display='flex'
            justifyContent='center'
            alignItems='center'
            rounded={4}
            boxShadow={`1px 2px 0px 0px ${shortcutShadowColor}}`}
          >
            <Text fontSize={12}>/</Text>
          </Box>
        </InputRightElement>
      )}
      {query && (
        <InputRightElement w={10}>
          <IconButton
            variant={'ghost'}
            w={10}
            color={iconButtonColor}
            _hover={{
              background: 'transparent',
              color: iconButtonColorHover,
            }}
            aria-label='Clear search query'
            icon={<IoIosClose fontSize={24} />}
            onClick={handleClearClick}
          />
        </InputRightElement>
      )}
    </InputGroup>
  )
}

export default SearchInput
