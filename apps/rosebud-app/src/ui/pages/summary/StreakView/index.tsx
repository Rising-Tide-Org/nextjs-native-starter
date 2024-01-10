import {
  Box,
  CloseButton,
  Flex,
  Heading,
  Text,
  useTheme,
  VStack,
} from '@chakra-ui/react'
import { AnimatePresence } from 'framer-motion'
import Analytics from 'lib/analytics'
import { useSummaryProvider } from 'providers/SummaryProvider'
import { useEffect, useState } from 'react'
import { Streak } from 'types/Streak'
import MotionBox from 'ui/core/MotionBox'
import SummaryBottomBar from '../SummaryView/SummaryBottomBar'
import ConfettiView from './ConfettiView'
import ContentView from './ContentView'

type Props = {
  streak: Streak
}
const StreakView = ({ streak }: Props) => {
  useEffect(() => {
    Analytics.trackEvent('summary.streak.view', { streak: streak?.current })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [showConfetti, setShowConfetti] = useState(false)
  const [slideStreak, setSlideStreak] = useState(false)
  const [showContinue, setShowContinue] = useState(false)

  return (
    <Flex direction='column' position='relative' h='full'>
      {showConfetti && <ConfettiView />}
      <StreakCloseButton />

      <AnimatePresence>
        <Box pb='120px' overflowY='auto'>
          <MotionBox
            key='count'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.5 } }}
            onAnimationStart={() => {
              setTimeout(() => {
                setShowConfetti(true)
              }, 600)
            }}
            onAnimationComplete={() => {
              setTimeout(() => {
                setSlideStreak(true)
              }, 1000) // delay for confetti to show up and then slide the streak
              setTimeout(() => {
                setShowContinue(true)
              }, 1000) // delay for confetti to show up and then slide the streak
            }}
          >
            <VStack mx='auto' py={20} spacing={0} zIndex={1}>
              <Heading fontSize='60px' color='brand.500'>
                {streak?.current}
              </Heading>
              <Text textTransform='uppercase' color='brand.500'>
                day streak
              </Text>
            </VStack>
          </MotionBox>

          {slideStreak && (
            <MotionBox
              key='content'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                opacity: { duration: 1, ease: 'easeOut' },
              }}
            >
              <ContentView />
            </MotionBox>
          )}
        </Box>

        {showContinue && (
          <MotionBox
            key='continue'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              opacity: { duration: 0.3, ease: 'easeOut' },
            }}
          >
            <ExitButton />
          </MotionBox>
        )}
      </AnimatePresence>
    </Flex>
  )
}

const StreakCloseButton = () => {
  const { exitSummary } = useSummaryProvider()
  const { zIndices } = useTheme()
  return (
    <CloseButton
      onClick={exitSummary}
      position='absolute'
      top={3}
      right={4}
      zIndex={zIndices.sticky}
    />
  )
}

const ExitButton = () => {
  const { exitSummary } = useSummaryProvider()

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 1 } }}
    >
      <SummaryBottomBar
        onClick={() => exitSummary()}
        data-testid='streak-done-button'
      >
        Continue
      </SummaryBottomBar>
    </MotionBox>
  )
}

export default StreakView
