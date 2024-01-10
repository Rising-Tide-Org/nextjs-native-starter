import { Box, Button } from '@chakra-ui/react'
import moment from 'moment'
import { IoIosCheckmarkCircle } from 'react-icons/io'
import EmptyPageState from 'ui/core/EmptyPageState'
import { RbClockFill } from 'ui/shared/Icon'
import CountdownTimer from '../CountdownTimer'

type Props = {
  week: string
  onRunAnalysis: () => void
  isLoading: boolean
}

const WeekDetailEmptyState = ({ week, onRunAnalysis, isLoading }: Props) => {
  const currentWeek = moment().format('YYYY-WW')
  const groupWeek = moment(week, 'GGGG-WW').format('YYYY-WW')
  const weekEndDate = moment(week, 'GGGG-WW').endOf('week').toDate()

  const isLocked =
    currentWeek === groupWeek && moment(weekEndDate).isAfter(moment())

  return (
    <EmptyPageState
      icon={
        isLocked ? (
          <RbClockFill boxSize='48px' />
        ) : (
          <Box as={IoIosCheckmarkCircle} size='48px' color='green.500' />
        )
      }
      header={isLocked ? 'Insights unlock this Sunday' : 'Ready to analyze'}
      label={isLocked ? undefined : 'Analyze your weekly entries for insights.'}
      afterElement={
        isLocked ? (
          <CountdownTimer targetDate={weekEndDate} />
        ) : (
          <Button
            variant='primary'
            onClick={onRunAnalysis}
            isLoading={isLoading}
            loadingText='Reviewing... '
          >
            Analyze week &rarr;
          </Button>
        )
      }
    />
  )
}

export default WeekDetailEmptyState
