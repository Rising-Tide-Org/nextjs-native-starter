import {
  VStack,
  Flex,
  Text,
  Spacer,
  Button,
  Heading,
  IconButton,
} from '@chakra-ui/react'
import { PriceDiscoveryVariant } from 'constants/premium'
import router from 'next/router'
import { useModalProvider } from 'providers/ModalProvider'
import { useSubscriptionProvider } from 'providers/SubscriptionProvider'
import { useUserProvider } from 'providers/UserProvider'
import { useEffect, useMemo } from 'react'
import html2canvas from 'html2canvas'
import { IoGift } from 'react-icons/io5'
import { FiDownload } from 'react-icons/fi'
import { PiBookFill, PiBookOpen } from 'react-icons/pi'
import { kViewPadding } from 'ui/constants'
import Panel from 'ui/core/Panel'
import TopGoals from './TopGoals'
import YearStats from './YearStats'
import { useLifemapProvider } from 'providers/LifemapProvider'
import EmptyLifemapPage from './EmptyLifemapPage'
import { useEntryProvider } from 'providers/EntryProvider'
import Analytics from 'lib/analytics'

const LifemapPage = () => {
  const { subscriptionTier, openSubscribeModal } = useSubscriptionProvider()
  const { user, setUserVariant } = useUserProvider()
  const { reviewTopics, viewedTopics, isAvailable } = useLifemapProvider()
  const { entries } = useEntryProvider()
  const openModal = useModalProvider()

  useEffect(() => {
    const { utm_campaign, utm_medium, utm_source } = router.query

    Analytics.trackEvent('review.view', {
      year: '2023',
      utm_campaign,
      utm_medium,
      utm_source,
    })
  }, [])

  const groupedTopics = useMemo(() => {
    if (reviewTopics.length === 0) return {}

    // Group topics by type (person, emotion, topic)
    const grouped: Record<string, typeof reviewTopics> = {}
    reviewTopics.forEach((topic) => {
      if (!grouped[topic.metadata.type]) {
        grouped[topic.metadata.type] = [topic]
      } else {
        grouped[topic.metadata.type].push(topic)
      }
    })

    // Sort each group by metadata.mentions
    Object.keys(grouped).forEach((type) => {
      grouped[type].sort(
        (a, b) =>
          // TODO: Fix duplicate tag issue
          // SD: Sorting by references here instead of mentions since there are duplicates
          // where a topic references a subset of entries that another topic references
          (b.references?.entries?.length ?? 0) -
          (a.references?.entries?.length ?? 0)
      )
    })

    return grouped
  }, [reviewTopics])

  const handleViewSummary = async (topicId?: string) => {
    if (user.variants?.pricing !== PriceDiscoveryVariant.withDiscount) {
      // Assign to with-discount Bloom variant since that's what Stripe portal supports
      // This will allow user to see Ask Rosebud on both Topic and Today pages
      await setUserVariant('pricing', PriceDiscoveryVariant.withDiscount)
    }

    if (
      subscriptionTier !== 'bloom' &&
      viewedTopics?.length &&
      !viewedTopics?.map((t) => t.id).includes(topicId)
    ) {
      return openSubscribeModal('yearInReview')
    }

    if (!user.settings.memoryEnabled || !user.metadata?.backfilledVectors) {
      return openModal('memory')
    }
    router.push(`/review/${topicId}`)
  }

  const handleGenerateImage = async () => {
    const div = document.getElementById('yearly-stats')
    if (!div) {
      console.error('No component to generate image from')
      return
    }

    const canvas = await html2canvas(div)
    // Converts the canvas to a JPEG URL
    const image = canvas.toDataURL('image/jpeg')

    // Create a link to download the image
    const link = document.createElement('a')
    link.href = image
    link.download = 'rosebud-review-2023.jpeg'
    link.click()
  }

  return (
    <VStack p={kViewPadding} maxW='700px' mx='auto' w='full' mt={8}>
      <Flex direction='row' alignItems='center' w='full' position='relative'>
        <Flex justifyContent='center' w='full' direction='column'>
          <Heading size='xl' fontFamily='Outfit' textAlign='center' pb={2}>
            2023
          </Heading>
          <Heading size='lg' fontFamily='Outfit' textAlign='center'>
            Year in Review
          </Heading>
        </Flex>
        {reviewTopics.length !== 0 && (
          <IconButton
            aria-label='Download'
            variant='secondary'
            icon={<FiDownload size={16} />}
            size='sm'
            position='absolute'
            right={0}
            onClick={handleGenerateImage}
          />
        )}
      </Flex>
      {!isAvailable ? (
        <EmptyLifemapPage entriesCount={entries.length} />
      ) : (
        <>
          <YearStats groupedTopics={groupedTopics} />
          <Flex direction='column' w='full'>
            {groupedTopics &&
              Object.entries(groupedTopics)
                .sort((a, b) => a[0].localeCompare(b[0]))
                ?.filter(([type]) => type !== 'emotion')
                .map(([type, topics]) => {
                  const label =
                    type === 'person' ? 'Top people' : 'Frequent topics'
                  return (
                    <Flex key={type} direction='column' w='full'>
                      <Text
                        key={type}
                        fontWeight='bold'
                        fontSize='xl'
                        pt={10}
                        pb={7}
                      >
                        {label}
                      </Text>
                      <Flex gap={2} flexWrap='wrap' w='full'>
                        {topics?.slice(0, 3).map((topic) => (
                          <Panel
                            key={topic.id}
                            variant='vstack'
                            h='200px'
                            maxWidth={{ base: '100%', md: 'calc(33%)' }}
                            flex={1}
                          >
                            <Text fontSize='19px' fontWeight='medium'>
                              {topic.emoji} {topic.title}
                            </Text>
                            <Text color='textSecondary'>
                              {topic.metadata.mentions} mentions
                            </Text>
                            <Spacer />
                            <Button
                              bg='transparent'
                              border='1px solid'
                              borderColor='border'
                              onClick={() => handleViewSummary(topic.id)}
                              leftIcon={
                                subscriptionTier !== 'bloom' &&
                                !viewedTopics?.length ? (
                                  <IoGift />
                                ) : topic.metadata.lastPageGeneration ? (
                                  <PiBookOpen />
                                ) : (
                                  <PiBookFill />
                                )
                              }
                            >
                              Summary
                            </Button>
                          </Panel>
                        ))}
                      </Flex>
                    </Flex>
                  )
                })}
            <TopGoals />
          </Flex>
        </>
      )}
    </VStack>
  )
}

export default LifemapPage
