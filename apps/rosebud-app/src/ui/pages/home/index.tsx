import { Box, Divider, Flex, Spacer } from '@chakra-ui/react'
import { useEffect, useMemo } from 'react'
import Analytics from 'lib/analytics'
import CommitmentList from './CommitmentList'
import OnboardingModals from './OnboardingModals'
import ReferralCTA from './ReferralCTA'
import { kViewPadding } from 'shared/ui/constants'
import NavigationBar from 'ui/global/Navigation/NavigationBar'
import WeeklyReportCTA from './WeeklyReportCTA'
import WeeklyStreakSummary from './WeeklyStreakSummary'
import LaunchPad from './LaunchPad'
import DateHeading from './DateHeading'
import PageHeading from 'ui/global/PageHeading'
import AskRosebud from './AskRosebud'
import useIsMobile from 'shared/hooks/useIsMobile'
import { AskProvider } from 'providers/AskProvider'
import YearInReviewCTA from './YearInReviewCTA'
import { useLifemapProvider } from 'providers/LifemapProvider'
import router from 'next/router'

const HomeComponent = () => {
  const isMobile = useIsMobile()
  const { viewedTopics, isAvailable } = useLifemapProvider()

  useEffect(() => {
    const { utm_campaign, utm_medium, utm_source } = router.query

    Analytics.trackEvent('journal.view', {
      utm_campaign,
      utm_medium,
      utm_source,
    })
  }, [])

  const showReviewCTA = useMemo(
    () => isAvailable && (!viewedTopics.length || isMobile),
    [isAvailable, viewedTopics.length, isMobile]
  )

  return (
    <>
      <NavigationBar title={<DateHeading />} />

      <Flex
        direction='column'
        px={kViewPadding}
        pb={6}
        w='full'
        gap={4}
        mt={{ base: 2, md: 6 }}
        mx='auto'
      >
        {showReviewCTA ? <YearInReviewCTA /> : null}

        <Flex w='full' align='center' mt={2}>
          <PageHeading flex={1} mt={0} mx={0}>
            <DateHeading />
          </PageHeading>
          <WeeklyStreakSummary />
        </Flex>

        <WeeklyReportCTA />

        <Divider my={{ base: 0, md: 3 }} borderColor='inherit' />

        <LaunchPad />

        <Flex
          direction={{ base: 'column', md: 'row' }}
          pt={6}
          gap={{ base: 6, md: 0 }}
        >
          <Box flex={1}>
            <CommitmentList />
          </Box>
          <Box flex={1} pl={isMobile ? 0 : 6}>
            <AskProvider>
              <AskRosebud />
            </AskProvider>
          </Box>
        </Flex>
      </Flex>
      <Spacer />
      <Divider borderColor='inherit' />

      <ReferralCTA />

      <OnboardingModals />
    </>
  )
}

export default HomeComponent
