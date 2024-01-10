import {
  Box,
  Button,
  Flex,
  Tag,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react'
import routes from 'lib/routes'
import NextLink from 'next/link'
import { useRef } from 'react'
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react'
import { AskItem, AskDisplayMode } from 'types/Ask'
import Panel from 'ui/core/Panel'

type Props = {
  restrictAccess: boolean
  suggestedAsks: AskItem[]
  handleAskClick(ask: AskItem): void
  displayMode?: AskDisplayMode
}

const SuggestedAsks = ({
  restrictAccess,
  suggestedAsks,
  displayMode = 'full',
  handleAskClick,
}: Props) => {
  const swiperRef = useRef<SwiperRef>(null)
  const bgColor = useColorModeValue('white', 'transparent')

  if (restrictAccess) {
    return (
      <Panel
        variant='vstack'
        p={0}
        w='full'
        overflow='hidden'
        textAlign='center'
      >
        <VStack
          align='start'
          w='100%'
          spacing={0}
          py='54px'
          justifyContent={'center'}
          textAlign={'center'}
          gap={6}
          backgroundColor={bgColor}
        >
          <Text fontSize='md' color='brandGray.500' m='0 auto' maxW='280px'>
            Requires 3 entries to unlock.
          </Text>
          <Box w='full'>
            <NextLink href={routes.compose()}>
              <Button variant='primary'>Write entry &rarr;</Button>
            </NextLink>
          </Box>
        </VStack>
      </Panel>
    )
  }

  if (displayMode === 'lite') {
    return (
      <Flex w='full'>
        <Swiper
          ref={swiperRef}
          style={{
            zIndex: 0,
            overflowY: 'hidden',
            minWidth: 0,
            width: '100%',
            maxWidth: '100%',
            minHeight: 0,
            maxHeight: '100%',
          }}
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
          {suggestedAsks.map((ask, index) => (
            <SwiperSlide key={index} style={{ width: 'fit-content' }}>
              <Tag
                key={index}
                cursor='pointer'
                bg='transparent'
                border='1px solid'
                borderColor='inherit'
                fontWeight={450}
                fontSize={{ base: '16px', md: '15px' }}
                textOverflow={'ellipsis'}
                px={2}
                py={{ base: 2, md: 1 }}
                _hover={{
                  borderColor: 'brandGray.500',
                  transition: 'all 0.25s',
                }}
                onClick={() => handleAskClick(ask)}
                w={{ base: 'full', md: 'auto' }}
              >
                {ask.content}
              </Tag>
            </SwiperSlide>
          ))}
        </Swiper>
      </Flex>
    )
  }

  return (
    <Flex direction='row' gap={2} wrap='wrap'>
      {suggestedAsks.map((ask, index) => (
        <Tag
          key={index}
          cursor='pointer'
          bg='transparent'
          border='1px solid'
          borderColor='inherit'
          fontWeight={450}
          fontSize={{ base: '16px', md: '15px' }}
          textOverflow={'ellipsis'}
          px={2}
          py={{ base: 2, md: 1 }}
          _hover={{
            borderColor: 'brandGray.500',
            transition: 'all 0.25s',
          }}
          onClick={() => handleAskClick(ask)}
          w={{ base: 'full', md: 'auto' }}
        >
          {ask.content}
        </Tag>
      ))}
    </Flex>
  )
}

export default SuggestedAsks
