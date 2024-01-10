import { Box, Circle, Flex, Text } from '@chakra-ui/react'
import routes from 'lib/routes'
import moment from 'moment'
import { useRouter } from 'next/router'
import { useEntryProvider } from 'providers/EntryProvider'
import { useStreakProvider } from 'providers/StreakProvider'
import { UserFlag } from 'types/User'
import CoachMark from 'ui/shared/CoachMark'
import { RbCheckmark, RbSummary } from 'ui/shared/Icon'

const WeeklyStreakSummary = () => {
  const router = useRouter()
  const { completions } = useStreakProvider()
  const { weeklySummaryAvailable } = useEntryProvider()

  const startDate = moment().startOf('isoWeek')

  const daysInWeek = Array(8)
    .fill(0)
    .map((_, index) => startDate.clone().add(index, 'day'))

  const handleClick = (day: number) => {
    if (day !== daysInWeek.length - 1 || !weeklySummaryAvailable) {
      return
    }

    router.push(routes.entryWeek(weeklySummaryAvailable))
  }

  return (
    <Flex
      gap={2}
      justify='space-around'
      px={1}
      w={{ base: 'full', md: 'auto' }}
    >
      {daysInWeek.map((day, index) => {
        const isCompleted = completions.some((completion) =>
          moment(completion.day).isSame(day, 'day')
        )
        const isWeeklySummaryDay =
          weeklySummaryAvailable && index === daysInWeek.length - 1
        const isToday = day.isSame(moment(), 'day')
        const bgColor = isWeeklySummaryDay ? 'brand.500' : 'transparent'

        const textColor = (() => {
          if (isToday) {
            return 'brand.500'
          } else if (isWeeklySummaryDay) {
            return 'white'
          }
          return 'textSecondary'
        })()

        const isSummaryDay = index === daysInWeek.length - 1

        return (
          <Circle
            key={index}
            size={{ base: 9, md: 8 }}
            bgColor={bgColor}
            color={textColor}
            position='relative'
            onClick={() => handleClick(index)}
            cursor={isWeeklySummaryDay ? 'pointer' : 'default'}
            border='1px solid'
            borderColor={
              isToday || isWeeklySummaryDay ? 'brand.500' : 'inherit'
            }
          >
            {isCompleted && (
              <Circle
                bg='green.500'
                color='white'
                bottom={{ base: '-1px', md: '-3px' }}
                right={{ base: '-1px', md: '-3px' }}
                position='absolute'
                size={3}
              >
                <RbCheckmark boxSize='8px' />
              </Circle>
            )}
            {isSummaryDay ? (
              <CoachMark flag={UserFlag.weeklySummaryTipSeen}>
                <Box>
                  <RbSummary boxSize={{ base: '18px', md: '14px' }} mt='-3px' />
                </Box>
              </CoachMark>
            ) : (
              <Text fontSize={{ base: '13px', md: '11px' }} fontWeight={600}>
                {day.format('dd').substring(0, 1).toUpperCase()}
              </Text>
            )}
          </Circle>
        )
      })}
    </Flex>
  )
}

export default WeeklyStreakSummary
