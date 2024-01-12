import { Flex, IconButton, VStack } from '@chakra-ui/react'
import { ComposeTemplateMetadata } from 'types/Compose'
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react'
import { useEntryProvider } from 'providers/EntryProvider'
import { useMemo, useRef } from 'react'
import { kJournals } from 'constants/templates'
import { rankTemplates } from 'util/template'
import JournalCard from './JournalCard'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { kGlobalLayoutMinWidth, kGlobalLayoutWidthNarrow } from 'shared/ui/constants'
import SmallCapsHeading from 'ui/core/SmallCapsHeading'
import RequestJournalCTA from '../RequestJournalCTA'

const kArrowButtonProps = {
  size: 'xs',
}

const GuidedJournals = () => {
  const { entries } = useEntryProvider()
  const swiperRef = useRef<SwiperRef>(null)

  const rankedJournals: ComposeTemplateMetadata[] = useMemo(
    () => rankTemplates(entries, kJournals),
    [entries]
  )

  const handleNext = () => {
    swiperRef?.current?.swiper.slideNext()
  }

  const handlePrev = () => {
    swiperRef?.current?.swiper.slidePrev()
  }

  return (
    <VStack w='full' align='start'>
      <Flex justify='space-between' align='center' pb={2} w='full'>
        <SmallCapsHeading mb={0}>Guided Journals</SmallCapsHeading>
        <Flex align='center' gap={2}>
          <IconButton
            icon={<FiChevronLeft size='18' />}
            aria-label='Previous Page'
            variant='secondary'
            onClick={handlePrev}
            {...kArrowButtonProps}
          />
          <IconButton
            icon={<FiChevronRight size='18' />}
            aria-label='Next Page'
            variant='secondary'
            onClick={handleNext}
            {...kArrowButtonProps}
          />
        </Flex>
      </Flex>
      <Flex w='full'>
        <Swiper
          ref={swiperRef}
          style={{ zIndex: 0, overflowY: 'hidden' }}
          breakpoints={{
            [kGlobalLayoutWidthNarrow]: {
              spaceBetween: 9,
            },
            [kGlobalLayoutMinWidth]: {
              slidesPerGroup: 3,
              slidesPerView: 5.2,
            },
          }}
          mousewheel={{
            forceToAxis: true,
          }}
          cssMode
          spaceBetween={6}
          slidesPerView={2.1}
          slidesPerGroup={2}
          onSwiper={(swiper) => {
            // Disable vertical scrolling
            swiper.wrapperEl.style.overflowY = 'hidden'
          }}
        >
          {rankedJournals.map((journal) => (
            <SwiperSlide key={journal.templateId}>
              <JournalCard journal={journal} />
            </SwiperSlide>
          ))}
          <SwiperSlide>
            <RequestJournalCTA />
          </SwiperSlide>
        </Swiper>
      </Flex>
    </VStack>
  )
}

export default GuidedJournals
