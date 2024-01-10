import { IconButton, Text, useTheme } from '@chakra-ui/react'
import AudioSignal from 'ui/shared/AudioSignal'
import { RbStop } from 'ui/shared/Icon'
import { useStopwatch } from 'react-timer-hook'
import { useEffect } from 'react'

type Props = {
  stopRecording: () => void
  isRecording: boolean
  isSpeaking: boolean
}

const ActiveRecordingActionBar = ({
  stopRecording,
  isRecording,
  isSpeaking,
}: Props) => {
  const { colors } = useTheme()
  const { seconds, minutes, start, pause, reset } = useStopwatch({
    autoStart: false,
  })

  useEffect(() => {
    if (isRecording) {
      start()
    } else {
      reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording])

  useEffect(() => {
    if (minutes >= 5) {
      reset()
      stopRecording()
    }
  }, [isRecording, minutes, pause, reset, stopRecording])

  return (
    <>
      <IconButton
        onClick={stopRecording}
        aria-label='stop'
        variant='outline'
        fontSize='14px'
        icon={<RbStop boxSize='18px' color={colors.red[500]} />}
        isLoading={isRecording}
      />
      <Text
        css={{ fontVariantNumeric: 'tabular-nums' }}
        fontSize='14px'
        color='brandGray.600'
      >
        {minutes}:{seconds > 9 ? seconds : `0${seconds}`} / 5:00
      </Text>
      <AudioSignal isSilent={!isSpeaking} />
    </>
  )
}

export default ActiveRecordingActionBar
