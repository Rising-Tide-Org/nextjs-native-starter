import { Box, Text } from '@chakra-ui/react'
import { useState, useEffect } from 'react'

type Props = {
  targetDate: Date
}

const CountdownTimer = ({ targetDate }: Props) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0)

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime()
      const distance = targetDate.getTime() - now

      setTimeRemaining(distance)
    }

    updateTimer() // Initial update
    const timerID = setInterval(updateTimer, 1000) // Update every second

    return () => clearInterval(timerID) // Cleanup
  }, [targetDate])

  let display = ''

  if (timeRemaining > 0) {
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24))
    const hours = Math.floor(
      (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    )
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000)

    display = `${
      days > 0 ? `${days} days, ` : ''
    }${hours} hours, ${minutes} minutes, ${seconds} seconds`
  }

  return (
    <Box>
      <Text color='brandGray.500' align='center'>
        {display}
      </Text>
    </Box>
  )
}

export default CountdownTimer
