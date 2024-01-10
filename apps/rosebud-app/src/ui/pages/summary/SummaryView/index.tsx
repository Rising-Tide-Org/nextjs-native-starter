import { Box, Flex } from '@chakra-ui/react'
import { AnimatePresence } from 'framer-motion'
import { useSummaryProvider } from 'providers/SummaryProvider'
import TopBar from 'ui/global/TopBar'
import SummaryActionsList from './SummaryActionsList'
import SummaryReflection from './SummaryReflection'
import SummaryEntities from './SummaryEntities'
import { useNavigationProvider } from 'providers/NavigationProvider'
import StreakView from '../StreakView'
import { useCallback, useMemo } from 'react'
import { useStreakProvider } from 'providers/StreakProvider'
import SummaryBottomBar from './SummaryBottomBar'

const SummaryView = () => {
  const { streak } = useStreakProvider()
  const { pushView } = useNavigationProvider()
  const {
    reflectionDone,
    entry,
    entities,
    isEntryTooShort,
    isStreak,
    exitSummary,
  } = useSummaryProvider()

  const summaryActionsListTitle = useMemo(
    () =>
      entry.templateId === 'new-year-2024'
        ? "New Year's Resolutions"
        : 'Suggestions',
    [entry?.templateId]
  )

  /**
   * If this entry is responsible for continuing the streak,
   * show the streak view, otherwise exit the summary
   */
  const handleContinue = useCallback(() => {
    if (isStreak && streak) {
      pushView(<StreakView streak={streak} />)
    } else {
      exitSummary()
    }
  }, [isStreak, pushView, streak, exitSummary])

  return (
    <Box h='100%'>
      <TopBar title='Entry Reflection' hideBackButton overlayEffect />

      <Flex direction='column' gap={6} pb='60px'>
        <SummaryReflection />

        <AnimatePresence>
          {(reflectionDone || isEntryTooShort) && (
            <Box mb={8}>
              <SummaryActionsList title={summaryActionsListTitle} />
              {entities && (
                <Box px={2}>
                  <SummaryEntities
                    // TODO: this will be enabled once we launch Lifemap
                    navigable={false}
                    entryId={entry.id!}
                    animate={true}
                    entities={entities}
                    source='summaryView'
                  />
                </Box>
              )}
            </Box>
          )}
        </AnimatePresence>
      </Flex>

      {(reflectionDone || isEntryTooShort) && (
        <SummaryBottomBar
          onClick={handleContinue}
          data-testid='summary-done-button'
        >
          Continue
        </SummaryBottomBar>
      )}
    </Box>
  )
}

export default SummaryView
