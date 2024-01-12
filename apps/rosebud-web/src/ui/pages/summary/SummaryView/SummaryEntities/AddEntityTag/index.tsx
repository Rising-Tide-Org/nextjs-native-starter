import {
  Box,
  BoxProps,
  Flex,
  Input,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Tag,
  TagLabel,
  Text,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { createRecord, updateRecord } from 'db/mutate'
import { arrayUnion, increment, query, where } from 'firebase/firestore'
import useFetchMany from 'shared/hooks/useFetchMany'
import useShortcutKeyDown from 'shared/hooks/useShortcutKeyDown'
import Analytics from 'lib/analytics'
import { useCallback, useState } from 'react'
import { CollectionItemTopic, CollectionItemTopicType } from 'types/Collection'
import { Entry } from 'types/Entry'
import MotionBox from 'shared/ui/core/MotionBox'
import { titleCase } from 'util/string'

type Props = BoxProps & {
  entryId: string
  type: CollectionItemTopicType
  index: number
  animate: boolean
  existingTags: CollectionItemTopic[]
  source?: string // The origin component that is rendering this component
}

const AddEntityTag = ({
  index,
  entryId,
  type,
  animate,
  existingTags,
  source,
  ...props
}: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState('')
  const [searchResults, setSearchResults] = useState<CollectionItemTopic[]>([])
  const [selectedResultIndex, setSelectedResultIndex] = useState(0)

  const { data: tags } = useFetchMany<CollectionItemTopic>(
    'items',
    (q) => query(q, where('metadata.type', '==', type as string)),
    // subscribe so we have real-time mention counts
    // fixes the case where a user removes a tag and then goes to add it back.
    // without subscribing, the count is +1 more than it should because the data was
    // fetched before the removal.
    { subscribe: true }
  )

  const onEscKey = useCallback(() => {
    if (isEditing) cancelEditing()
  }, [isEditing])

  useShortcutKeyDown(['Escape'], onEscKey)

  const cancelEditing = useCallback(() => {
    onClose()
    setIsEditing(false)
    setSelectedResultIndex(0)
  }, [onClose])

  /**
   * @param index The index of the tapped, clicked, or selected by ENTER search result.
   */
  const createNewTag = async (index: number) => {
    let tag: CollectionItemTopic

    // Skip if tag already exists
    if (
      existingTags?.find(
        (t) => t.title?.toLowerCase().trim() === value.toLowerCase().trim()
      )
    ) {
      return
    }

    // If the "Create" option is selected, create a new tag
    const isNew = index === searchResults.length

    Analytics.trackEvent('entry.tag.add', { source, isNew })

    try {
      // Otherwise create or update tag
      if (isNew) {
        // New tag
        tag = {
          type: 'topic',
          title: titleCase(value),
          metadata: {
            type,
            mentions: 1,
          },
        }

        const docRef = await createRecord<CollectionItemTopic>('items', tag)
        tag.id = docRef?.id
      } else {
        // Existing tag
        tag = searchResults[index]
        await updateRecord<CollectionItemTopic>(
          'items',
          tag.id!,
          {},
          {
            'metadata.mentions': increment(1),
          }
        )
      }

      cancelEditing()
      setValue('')
      setIsEditing(false)

      // Add tag to entry
      if (tag.id) {
        await updateRecord<Entry>(
          'entries',
          entryId,
          {},
          { tags: arrayUnion(tag), tagIndex: arrayUnion(tag.id) }
        )
      }

      Analytics.trackEvent('entry.tag.add.success', { source, isNew })
    } catch (error) {
      Analytics.trackEvent('entry.tag.add.error', {
        isNew,
        source,
        error: error.message,
      })
    }
  }

  const handleKeyPress = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        createNewTag(selectedResultIndex)
      } else if (e.key === 'ArrowUp') {
        setSelectedResultIndex(
          selectedResultIndex === 0
            ? searchResults.length
            : selectedResultIndex - 1
        )
      } else if (e.key === 'ArrowDown') {
        setSelectedResultIndex(
          selectedResultIndex === searchResults.length
            ? 0
            : selectedResultIndex + 1
        )
      }
    },
    [
      existingTags,
      selectedResultIndex,
      searchResults,
      source,
      cancelEditing,
      value,
      type,
      entryId,
    ]
  )

  const handleSearch = useCallback(
    (query: string) => {
      const formattedQuery = query.toLowerCase().trim()

      const matches =
        tags?.filter((tag) =>
          tag.title?.toLowerCase().trim().includes(formattedQuery)
        ) ?? []

      // Prioritize exact matches
      const exactMatches =
        matches?.filter((tag) =>
          tag.title?.toLowerCase().trim().startsWith(formattedQuery)
        ) ?? []

      // order the "exact" matches so the most exact (shortest) appears first
      exactMatches.sort(
        (a, b) => (a.title ?? '').length - (b.title ?? '').length
      )

      // Return exact matches first, then the rest
      const results = [
        ...exactMatches,
        ...matches.filter((tag) => !exactMatches.includes(tag)),
      ]

      // Filter out existing tags
      return results.filter(
        (r) => !existingTags?.find((t) => t.title === r.title)
      )
    },
    [existingTags, tags]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setValue(value)
      if (value.length > 1) {
        if (!isOpen) {
          onOpen()
        }
        const results = handleSearch(value)
        setSearchResults(results)
      } else {
        onClose()
        setSearchResults([])
      }
    },
    [isOpen, handleSearch, onOpen, onClose]
  )

  const handleBlur = () => {
    cancelEditing()
    setIsEditing(false)
  }

  const borderColor = useColorModeValue('brandGray.200', 'brandGray.700')
  const borderColorHover = useColorModeValue('brandGray.300', 'brandGray.600')

  return (
    <Popover
      placement='bottom-start'
      isOpen={isOpen}
      onClose={onClose}
      autoFocus={false}
    >
      <PopoverTrigger>
        <MotionBox
          as={Tag}
          bg='transparent'
          border='1px solid'
          borderColor={borderColor}
          _hover={{
            borderColor: borderColorHover,
          }}
          px={2}
          py={1}
          rounded='md'
          display='flex'
          gap={1}
          initial={animate ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.05 * index }}
          alignItems='center'
          cursor='pointer'
          onClick={() => setIsEditing(true)}
          {...props}
        >
          {isEditing ? (
            <Input
              fontSize='14px'
              color='icon'
              fontWeight={500}
              autoFocus
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyPress}
              p={0}
              outline='none'
              variant='unstyled'
            />
          ) : (
            <TagLabel fontSize='14px' color='icon' fontWeight={500}>
              + Add
            </TagLabel>
          )}
        </MotionBox>
      </PopoverTrigger>
      <Portal>
        {/* fixes issue in mobile where the splitview content has a higher z-index than the portal popper. */}
        <Box zIndex='popover' position='relative'>
          <PopoverContent maxH='140px' overflowY='auto' w='240px'>
            <PopoverBody p={0}>
              {searchResults.map((result, index) => {
                const isSelected = index === selectedResultIndex
                return (
                  <SearchResult isSelected={isSelected} key={result.id}>
                    <Flex
                      align='center'
                      justify='space-between'
                      cursor='pointer'
                      onClick={() => {
                        createNewTag(index)
                      }}
                    >
                      <Text noOfLines={1} wordBreak='break-all'>
                        {result.title}
                      </Text>
                      <Text fontSize='12px' color='brandGray.500'>
                        {result.metadata?.mentions}
                      </Text>
                    </Flex>
                  </SearchResult>
                )
              })}
              {existingTags?.find(
                (t) =>
                  t.title?.toLowerCase().trim() === value.toLowerCase().trim()
              ) ? (
                <SearchResult isSelected={false}>
                  <Text noOfLines={1}>Already added</Text>
                </SearchResult>
              ) : (
                <>
                  {value.length > 0 &&
                    (searchResults.length === 0 ||
                      !searchResults.find(
                        (t) =>
                          t.title?.toLowerCase().trim() ===
                          value.toLowerCase().trim()
                      )) && (
                      <SearchResult
                        isSelected={
                          selectedResultIndex === searchResults.length
                        }
                      >
                        <Text
                          noOfLines={1}
                          cursor='pointer'
                          onClick={() => {
                            createNewTag(searchResults.length)
                          }}
                        >
                          Create '{value}'
                        </Text>
                      </SearchResult>
                    )}
                </>
              )}
            </PopoverBody>
          </PopoverContent>
        </Box>
      </Portal>
    </Popover>
  )
}

const SearchResult = ({
  children,
  isSelected,
}: {
  children: React.ReactNode
  isSelected: boolean
}) => (
  <Box
    bg={isSelected ? 'bgSelected' : 'bg'}
    _hover={{
      bg: 'bgSelected',
    }}
    px={2}
    py={1}
    fontSize='14px'
  >
    {children}
  </Box>
)

export default AddEntityTag
