import {
  Box,
  Text,
  AspectRatio,
  Button,
  ButtonGroup,
  Spinner,
  Flex,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react'
import useShareContent from 'hooks/useShareContent'
import Analytics from 'lib/analytics'
import { useSummaryProvider } from 'providers/SummaryProvider'
import { useCallback, useEffect } from 'react'
import { MdRefresh } from 'react-icons/md'
import { RbSend } from 'ui/shared/Icon'
import { ucFirst } from 'util/string'

const ContentView = () => {
  const streakBgColor = useColorModeValue('white', 'brandGray.900')
  const { streakReward, fetchStreakReward, rewardStreaming, rewardError } =
    useSummaryProvider()
  const shareContent = useShareContent()

  useEffect(() => {
    fetchStreakReward()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleShare = useCallback(() => {
    if (!streakReward) {
      return
    }
    Analytics.trackEvent('summary.streak.share', { type: streakReward.type })
    shareContent({
      text:
        `${ucFirst(streakReward.type)} from today's Rosebud entry:\n\n` +
        streakReward?.content,
      source: 'streak',
    })
  }, [shareContent, streakReward])

  return (
    <Box position='relative' maxW='480px' mx='auto'>
      <Box
        bg={streakBgColor}
        position='absolute'
        left='50%'
        transform='translateX(-50%)'
        h='24px'
        top={'-8px'}
        zIndex={1}
        px={6}
      >
        <Text textTransform='uppercase' fontWeight={500} fontSize='13px'>
          {streakReward?.type}
        </Text>
      </Box>
      <AspectRatio
        ratio={1}
        border='2px solid'
        borderColor='inherit'
        mx={{ base: 4, md: 10 }}
        rounded='md'
        maxW='480px'
      >
        {rewardStreaming ? (
          <Flex>
            <Spinner size='md' />
          </Flex>
        ) : (
          <Flex>
            {rewardError ? (
              <IconButton
                icon={<MdRefresh size='30px' />}
                onClick={() => fetchStreakReward(streakReward?.type)}
                aria-label='Try again'
                variant='ghost'
                size='lg'
              />
            ) : (
              <Text
                fontSize='20px'
                fontWeight={500}
                textAlign='center'
                whiteSpace='pre-wrap'
                px={8}
                lineHeight='2rem'
              >
                {streakReward?.content}
              </Text>
            )}
          </Flex>
        )}
      </AspectRatio>
      <ButtonGroup w='full' justifyContent='center'>
        <Button
          variant='ghost'
          leftIcon={<RbSend boxSize='18px' />}
          minW='120px'
          mt={4}
          onClick={handleShare}
        >
          Share
        </Button>
      </ButtonGroup>
    </Box>
  )
}

export default ContentView
