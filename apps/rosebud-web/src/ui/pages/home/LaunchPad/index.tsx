import {
  Flex,
  IconButton,
  Tag,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react'
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react'
import { useEntryProvider } from 'providers/EntryProvider'
import { useMemo, useRef } from 'react'
import { kJournals } from 'constants/templates'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { usePromptProvider } from 'providers/PromptProvider'
import { useStreakProvider } from 'providers/StreakProvider'
import DailyEntryCard from './DailyEntryCard'
import { Template } from 'lib/template'
import SmallCapsHeading from 'ui/core/SmallCapsHeading'
import PromptCard from './PromptCard'
import MoreCard from './MoreCard'
import LoadingCard from './LoadingCard'
import useIsMobile from 'shared/hooks/useIsMobile'
import usePageVisibility from 'shared/hooks/usePageVisibility'
import JournalCard from 'ui/pages/library/GuidedJournals/JournalCard'

const kArrowButtonProps = {
  size: 'xs',
}

const LaunchPad = () => {
  const { dailyEntryCreated, newYears2024JournalCompleted } = useEntryProvider()
  const { streak } = useStreakProvider()
  const { prompts, promptsLoading, promptsGenerating } = usePromptProvider()
  const swiperRef = useRef<SwiperRef>(null)
  const isMobile = useIsMobile()
  const isPageVisible = usePageVisibility()
  const streakBg = useColorModeValue('gold.300', '#372F22')

  const handleNext = () => {
    swiperRef?.current?.swiper.slideNext()
  }

  const handlePrev = () => {
    swiperRef?.current?.swiper.slidePrev()
  }

  const checkInJournal = useMemo(
    () => {
      return kJournals.find(
        (j) => j.templateId === Template.getTemplateForCheckIn().id
      )
    },
    // We want to recompute when page visibility changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isPageVisible]
  )

  const newYears2024Journal = useMemo(
    () => {
      return kJournals.find((j) => j.templateId === 'new-year-2024')
    },
    // We want to recompute when page visibility changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isPageVisible]
  )

  if (promptsLoading) {
    return null
  }

  return (
    <VStack w='full' align='start'>
      <Flex justify='space-between' align='center' pb={2} w='full'>
        <SmallCapsHeading mb={0}>Daily journaling</SmallCapsHeading>
        <Flex align='center' gap={4}>
          {streak && (
            <Tag
              fontWeight={500}
              bg={streakBg}
              fontSize='14px'
              px={2}
              rounded='md'
            >
              🔥 {streak.current} day streak
            </Tag>
          )}
          <Flex align='center' gap={2} display={{ base: 'none', md: 'flex' }}>
            <IconButton
              icon={<FiChevronLeft size='18' />}
              aria-label='Previous Page'
              onClick={handlePrev}
              variant='secondary'
              {...kArrowButtonProps}
            />
            <IconButton
              icon={<FiChevronRight size='18' />}
              aria-label='Next Page'
              onClick={handleNext}
              variant='secondary'
              {...kArrowButtonProps}
            />
          </Flex>
        </Flex>
      </Flex>
      <Flex w='full'>
        <Swiper
          ref={swiperRef}
          style={{ zIndex: 0, overflowY: 'hidden', width: '100%' }}
          mousewheel={{
            forceToAxis: true,
          }}
          cssMode
          spaceBetween={6}
          slidesPerView='auto'
          slidesPerGroup={2}
          onSwiper={(swiper) => {
            // Disable vertical scrolling
            swiper.wrapperEl.style.overflowY = 'hidden'
          }}
        >
          <SwiperSlide
            style={{
              width: isMobile || dailyEntryCreated ? 'fit-content' : '50%',
            }}
          >
            {checkInJournal && (
              <DailyEntryCard
                key='cta'
                journal={checkInJournal}
                completed={dailyEntryCreated}
              />
            )}
          </SwiperSlide>
          {!newYears2024JournalCompleted && newYears2024Journal && (
            <SwiperSlide
              key={newYears2024Journal.templateId}
              style={{ width: 'fit-content' }}
            >
              <JournalCard journal={newYears2024Journal} h='full' w='240px' />
            </SwiperSlide>
          )}
          {promptsGenerating && (
            <SwiperSlide style={{ width: 'fit-content' }}>
              <LoadingCard text='Personalizing...' />
            </SwiperSlide>
          )}
          {prompts?.slice(0, 5).map((prompt) => (
            <SwiperSlide key={prompt.id} style={{ width: 'fit-content' }}>
              <PromptCard prompt={prompt} />
            </SwiperSlide>
          ))}

          <SwiperSlide style={{ width: 'fit-content' }}>
            <MoreCard />
          </SwiperSlide>
        </Swiper>
      </Flex>
    </VStack>
  )
}

export default LaunchPad
