import {
  ModalBody,
  Text,
  VStack,
  Button,
  Input,
  InputGroup,
  InputLeftAddon,
  Box,
} from '@chakra-ui/react'
import {
  useCallback,
  useDeferredValue,
  useState,
  ChangeEvent,
  useMemo,
} from 'react'
import { check } from 'net/phone'
import parsePhoneNumber, { AsYouType } from 'libphonenumber-js'
import LocalTimeSelector from 'ui/shared/LocalTimeSelector'
import { useUserProvider } from 'providers/UserProvider'
import { getNearestUTCHourFromLocal } from 'util/date'

type Props = {
  value?: string
  onSent: (value: string, localHour: number) => void
  reminderTime: number
  isUpdatingFlow?: boolean
}

const PhoneEntry = ({
  value = '',
  onSent,
  reminderTime,
  isUpdatingFlow,
}: Props) => {
  const { updateUser } = useUserProvider()
  const [hasError, setHasError] = useState(false)
  const [timeValue, setTimeValue] = useState<number>(reminderTime)
  const [phoneNumber, setPhoneNumber] = useState<string>(() => {
    const pn = parsePhoneNumber(value, 'US')
    if (!pn) {
      return value
    } else {
      return pn.format('NATIONAL')
    }
  })

  const [isSending, setSending] = useState(false)

  const formattedPhoneNumber = useMemo(() => {
    if (phoneNumber.length < 5) {
      return phoneNumber
    }

    return new AsYouType('US').input(phoneNumber)
  }, [phoneNumber])

  const isValidPhoneNumber = useMemo(() => {
    const pn = parsePhoneNumber(phoneNumber, 'US')
    if (!pn || !phoneNumber.length || phoneNumber.length < 4) {
      return false
    }

    return pn.isValid()
  }, [phoneNumber])

  const deferredPhoneNumber = useDeferredValue(formattedPhoneNumber)

  const onPhoneNumberChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      setPhoneNumber(ev.target.value)
    },
    []
  )

  const handleVerifyPhone = useCallback(() => {
    const pn = parsePhoneNumber(phoneNumber, 'US')

    // When can not parse phone number, show error
    if (!pn) {
      return setHasError(true)
    }

    const phone = pn.format('E.164')

    // Save preference immediately so it's available to the backend `/verify` route
    updateUser({ reminder_hour_utc: getNearestUTCHourFromLocal(timeValue) })

    setSending(true)
    check(phone)
      .then(() => {
        onSent(phone, timeValue)
      })
      .catch(() => {
        setHasError(true)
      })
      .finally(() => {
        setSending(false)
      })
  }, [phoneNumber, updateUser, timeValue, onSent])

  const onSelect = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    const hour = parseInt(e.target.value)
    setTimeValue(hour)
  }, [])

  return (
    <>
      <ModalBody fontSize='lg'>
        <VStack spacing={6} mb={6}>
          {isUpdatingFlow ? <Box /> : <CompellingText />}
          <VStack w='100%' spacing={2}>
            <InputGroup size='lg' width='100%'>
              <InputLeftAddon>+1</InputLeftAddon>
              <Input
                type='tel'
                autoComplete='tel'
                placeholder='Phone number'
                value={deferredPhoneNumber}
                onChange={onPhoneNumberChange}
                isInvalid={hasError}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleVerifyPhone()
                  }
                }}
              />
            </InputGroup>
            {isUpdatingFlow ? null : (
              <LocalTimeSelector
                prefix='Daily at '
                minW='100%'
                width='40%'
                size='lg'
                value={timeValue}
                onChange={onSelect}
              />
            )}
          </VStack>
          <Button
            variant='primary'
            size='lg'
            onClick={handleVerifyPhone}
            loadingText='Sending&hellip;'
            isLoading={isSending}
            isDisabled={!isValidPhoneNumber}
            width='100%'
          >
            {isUpdatingFlow ? 'Update number' : 'Enable reminders'}
          </Button>
          <Text fontSize='sm' color='textSecondary' w='100%' textAlign='left'>
            By providing your phone number, you agree to receive text messages
            from Rosebud. Message and data rates may apply. Message frequency
            varies. US and Canada only.
          </Text>
        </VStack>
      </ModalBody>
    </>
  )
}

const CompellingText = () => {
  return (
    <Text mt={2} fontSize='md'>
      To help you maintain a regular journaling habit, Rosebud can text you a
      daily reminder.
    </Text>
  )
}

export default PhoneEntry
