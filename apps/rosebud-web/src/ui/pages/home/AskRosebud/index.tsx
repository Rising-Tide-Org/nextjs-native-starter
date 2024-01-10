import {
  Box,
  Divider,
  Flex,
  IconButton,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  List,
  ListItem,
  Spacer,
  Text,
  Textarea,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react'
import { PriceDiscoveryVariant } from 'constants/premium'
import Analytics from 'lib/analytics'
import routes from 'lib/routes'
import moment from 'moment'
import { useRouter } from 'next/router'
import { useAskProvider } from 'providers/AskProvider'
import { useEntryProvider } from 'providers/EntryProvider'
import { useModalProvider } from 'providers/ModalProvider'
import { useSubscriptionProvider } from 'providers/SubscriptionProvider'
import { useUserProvider } from 'providers/UserProvider'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BsArrowRightShort } from 'react-icons/bs'
import ResizeTextarea from 'react-textarea-autosize'
import { AskItem, AskDisplayMode } from 'types/Ask'
import { TimestampRange } from 'types/EntryVector'
import { UserFlag } from 'types/User'
import SmallCapsHeading from 'ui/core/SmallCapsHeading'
import CoachMark from 'ui/shared/CoachMark'
import DateRangeMenu from 'ui/shared/DateRangeMenu'
import { RbQuestion } from 'ui/shared/Icon'
import { shuffleArray } from 'util/list'
import SuggestedAsks from './SuggestedAsks'

type Props = {
  topicTitle?: string
  displayMode?: AskDisplayMode
  returnTo?: string
}

const AskRosebud = ({ topicTitle, displayMode = 'full', returnTo }: Props) => {
  const { asks, recentAsks, createAsk, updateLastAskedAt } = useAskProvider()
  const { entries, entriesLoading } = useEntryProvider()
  const { subscriptionTier, openSubscribeModal } = useSubscriptionProvider()
  const { user, setUserFlag, setUserVariant } = useUserProvider()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [ask, setAsk] = useState<AskItem>()
  const [isAsking, setIsAsking] = useState(false)
  const [suggestedAsks, setSuggestedAsks] = useState<AskItem[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [memoryRange, setMemoryRange] = useState<TimestampRange>({})
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const tooltipIconColor = useColorModeValue('gray.500', 'whiteAlpha.900')
  const openModal = useModalProvider()

  const handleQueryChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const rawQuery = event.target.value
    setAsk(undefined)
    setQuery(rawQuery)
  }

  const handleAskClick = (ask: AskItem) => {
    setAsk(ask)
    setQuery(ask.content ?? '')
    setIsFocused(false)
  }

  const restrictAccess = useMemo(
    () =>
      entriesLoading === false &&
      entries.length < 3 &&
      subscriptionTier === 'bloom',
    [entries, entriesLoading, subscriptionTier]
  )

  const handleAskQuestion = useCallback(async () => {
    if (user.variants?.pricing !== PriceDiscoveryVariant.withDiscount) {
      await setUserVariant('pricing', PriceDiscoveryVariant.withDiscount)
    }

    if (subscriptionTier !== 'bloom') {
      return openSubscribeModal('askRosebud')
    }

    if (!user.settings.memoryEnabled || !user.metadata?.backfilledVectors) {
      return openModal('memory')
    }

    if (isAsking && !ask && !query.length) return

    let pendingAsk = ask ?? null
    if (!pendingAsk && query.length) {
      // If user-generated question, create Ask in db first
      pendingAsk = await createAsk(query)
    }

    if (!pendingAsk?.id) {
      Analytics.trackEvent('ask.submit.error')
      throw new Error('No question found')
    }

    // Clamps memory dates to fetch
    const { before, after } = memoryRange

    setIsAsking(true)
    updateLastAskedAt(pendingAsk.id)
    router.push(
      routes.composeAsk(pendingAsk.id, { before, after, returnTo }),
      undefined,
      {
        shallow: true,
      }
    )
    Analytics.trackEvent('ask.submit.success', {
      content: pendingAsk.content,
      isSuggested: Boolean(ask),
      hasDateRange: Boolean(before) || Boolean(after),
    })
  }, [
    user.variants?.pricing,
    user.settings.memoryEnabled,
    user.metadata?.backfilledVectors,
    subscriptionTier,
    isAsking,
    ask,
    query,
    memoryRange,
    updateLastAskedAt,
    router,
    returnTo,
    setUserVariant,
    openSubscribeModal,
    openModal,
    createAsk,
  ])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' || (e.key === 'Enter' && (e.metaKey || e.ctrlKey))) {
      handleAskQuestion()
      setIsAsking(true)
    }
  }

  const handleFocus = () => {
    Analytics.trackEvent('ask.focus')
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsFocused(true)
    setUserFlag(UserFlag.askRosebudTipSeen, true)
  }

  const handleBlur = () => {
    timeoutRef.current = setTimeout(() => setIsFocused(false), 150)
  }

  /**
   * Shuffles asks and places items that have already been asked at the back
   * of the array so that there are always suggestions
   */
  const shuffleAsks = (arr: AskItem[]) =>
    shuffleArray(arr)
      .sort(
        (a, b) =>
          (a.metadata?.lastAskedAt?.seconds ?? 0) -
          (b.metadata?.lastAskedAt?.seconds ?? 0)
      )
      .slice(0, 5)
      .sort((a, b) => a.content!.length - b.content!.length)

  /**
   * Filter recent asks dropdown to show related items to the user's query
   */
  const filteredRecentAsks = useMemo(() => {
    if (isAsking) return
    const queryWords = query
      .toLowerCase()
      .split(/\s+/)
      .filter((q) => q.length)
    if (!queryWords.length) return recentAsks
    return recentAsks?.filter((ask) =>
      queryWords.some((word) => ask.content?.toLowerCase().includes(word))
    )
  }, [query, recentAsks, isAsking])

  /**
   * Keeps suggested asks up to date unless user is asking something
   */
  useEffect(() => {
    if (isAsking) return
    setSuggestedAsks(shuffleAsks(asks ?? []))
  }, [asks, isAsking])

  return (
    <Box w='full'>
      <Flex direction='row' mb={5}>
        <SmallCapsHeading m={0}>Ask Rosebud</SmallCapsHeading>
        <Spacer />
        <DateRangeMenu onChange={(range) => setMemoryRange(range)} />
      </Flex>
      <Flex direction='column' position='relative' gap={3}>
        <CoachMark
          flag={UserFlag.askRosebudTipSeen}
          prerequisites={[UserFlag.weeklySummaryTipSeen]}
        >
          <InputGroup>
            <InputLeftElement>
              <Tooltip
                shouldWrapChildren
                label={
                  'Ask Rosebud is designed to provide in-depth answers based on your past entries.'
                }
              >
                <RbQuestion color={tooltipIconColor} boxSize='18px' />
              </Tooltip>
            </InputLeftElement>
            <Textarea
              as={ResizeTextarea}
              resize='none'
              minRows={1}
              minH={'unset'}
              px={10}
              maxLength={180}
              bg='bg'
              color='text'
              outline='none'
              placeholder={`Ask Rosebud anything about ${
                topicTitle ?? 'yourself'
              }...`}
              _placeholder={{
                color: 'brandGray.500',
              }}
              value={query}
              onChange={handleQueryChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              disabled={restrictAccess || isAsking}
              _focus={{
                borderBottomRadius: filteredRecentAsks?.length ? 0 : 'md',
                borderColor: 'border',
              }}
            />
            {isFocused && filteredRecentAsks?.length && (
              <Box
                position='absolute'
                top='100%'
                w='100%'
                bg='bg'
                zIndex={1}
                boxShadow='md'
                borderBottomRadius='md'
                border='1px solid'
                borderTop='0px'
                borderColor='border'
              >
                <List>
                  {filteredRecentAsks?.slice(0, 5).map((ask, index) => (
                    <>
                      <ListItem
                        key={index}
                        p={2}
                        m={0}
                        opacity={0.8}
                        _hover={{
                          opacity: 1,
                        }}
                        cursor='pointer'
                        onClick={() => handleAskClick(ask)}
                      >
                        <Flex
                          align='center'
                          whiteSpace='nowrap'
                          overflow='hidden'
                          textOverflow='ellipsis'
                          direction='row'
                          gap={3}
                        >
                          <Text color='brandGray.500' fontSize='10px'>
                            {ask.metadata?.lastAskedAt
                              ? moment
                                  .unix(ask.metadata?.lastAskedAt?.seconds)
                                  .format('MM/DD')
                              : '-'}
                          </Text>
                          <Text>{ask.content}</Text>
                        </Flex>
                      </ListItem>
                      <Divider my={0} />
                    </>
                  ))}
                </List>
              </Box>
            )}
            <InputRightElement w={10} h='100%'>
              {query.length > 6 && (
                <Flex direction='column' h='100%' justifyContent='center'>
                  <IconButton
                    w={8}
                    size={'sm'}
                    background='brand.500'
                    _hover={{
                      background: 'brand.600',
                    }}
                    borderRadius={4}
                    color='brandGray.100'
                    aria-label='Ask question'
                    icon={<BsArrowRightShort fontSize={24} />}
                    onClick={handleAskQuestion}
                    disabled={isAsking}
                    isLoading={isAsking}
                  />
                </Flex>
              )}
            </InputRightElement>
          </InputGroup>
        </CoachMark>
        <SuggestedAsks
          restrictAccess={restrictAccess}
          suggestedAsks={suggestedAsks}
          handleAskClick={handleAskClick}
          displayMode={displayMode}
        />
      </Flex>
    </Box>
  )
}

export default AskRosebud
