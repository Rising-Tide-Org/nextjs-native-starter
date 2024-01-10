import { Flex, Text, Box, Button } from '@chakra-ui/react'
import useShareContent from 'hooks/useShareContent'
import Analytics from 'lib/analytics'
import { useSummaryProvider } from 'providers/SummaryProvider'
import { TbRefresh } from 'react-icons/tb'
import { kViewPadding } from 'ui/constants'
import EmptyPageState from 'ui/core/EmptyPageState'
import { RbSend } from 'ui/shared/Icon'
import ThumbVote from 'ui/shared/ThumbVote'

const SummaryReflection = () => {
  const {
    reflectionTitle,
    reflection,
    reflectionDone,
    reflectionError,
    retryReflection,
    isEntryTooShort,
  } = useSummaryProvider()
  const shareContent = useShareContent()

  const handleShare = () => {
    Analytics.trackEvent('summary.reflection.share')
    shareContent({
      text: `${reflectionTitle}${reflection}`,
      source: 'summary',
    })
  }

  if (reflectionError) {
    return (
      <Box p={kViewPadding}>
        <EmptyPageState
          mt={kViewPadding}
          icon='😅'
          header='Something went wrong'
          label='The AI got lost in thought and couldn’t generate a reflection. Please try again.'
          border='1px solid'
          borderColor='brandGray.200'
          rounded='md'
          afterElement={
            <Button
              variant='outline'
              size='md'
              leftIcon={<TbRefresh size='18px' />}
              onClick={retryReflection}
            >
              Try again
            </Button>
          }
        />
      </Box>
    )
  }
  if (isEntryTooShort) {
    return (
      <Box p={kViewPadding}>
        <EmptyPageState
          header='No summary'
          label='Summaries are only available for entries with 20 words or more.'
          border='1px solid'
          borderColor='inherit'
          rounded='md'
        />
      </Box>
    )
  }

  return (
    <Box
      rounded='md'
      mx={kViewPadding}
      mt={kViewPadding}
      border='1px solid'
      borderColor='inherit'
      position='relative'
    >
      {reflectionTitle && (
        <Text
          fontSize={{ base: '16px', sm: '17px' }}
          whiteSpace='pre-wrap'
          p={4}
          fontWeight={500}
          data-sentry-block
        >
          {reflectionTitle.replace(/\n/g, ' ')}
        </Text>
      )}
      {!reflectionTitle ? (
        <Flex p={4} px={8}>
          <Box className='dot-flashing-animation' />
        </Flex>
      ) : (
        <Text
          fontSize={{ base: '16px', sm: '17px' }}
          whiteSpace='pre-wrap'
          px={4}
          pb={4}
          data-sentry-block
        >
          {reflection?.trim() ?? ''}
        </Text>
      )}

      {reflectionDone && (
        <Flex px={4} pb={4} justify='space-between' align='center'>
          <Button
            variant='outline'
            fontSize='14px'
            leftIcon={<RbSend boxSize='16px' />}
            minW='120px'
            onClick={handleShare}
          >
            Share
          </Button>
          <ThumbVote analyticsPrefix='summary.reflection.feedback' />
        </Flex>
      )}
    </Box>
  )
}

export default SummaryReflection
