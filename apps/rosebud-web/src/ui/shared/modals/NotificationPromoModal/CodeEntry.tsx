import {
  ModalBody,
  Text,
  VStack,
  Button,
  Input,
  HStack,
  Link,
} from '@chakra-ui/react'
import { useCallback, useState, ChangeEvent, useRef, useEffect } from 'react'
import { verify } from 'net/phone'

type Props = {
  phoneNumber: string
  onSuccess: () => void
  onCancel: () => void
}

const CodeLength = 4

const CodeEntry = ({ phoneNumber, onSuccess, onCancel }: Props) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isSending, setSending] = useState(false)
  const [code, setCode] = useState('')
  const [codeEntryError, setHasCodeEntryError] = useState(false)

  const onCodeChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
    const value = ev.target.value
    setCode(value.replace(/\D/g, ''))

    if (inputRef.current != null) {
      inputRef.current.value = value
    }
  }, [])

  const onCodeComplete = useCallback(
    (value: string) => {
      setSending(true)
      verify(phoneNumber, value)
        .then(onSuccess)
        .catch((error) => {
          if (error.code && error.code === 'incorrect') {
            setCode('')
            setHasCodeEntryError(true)
            inputRef.current?.focus()
          } else {
            // Might want to show some sort of error?
            onCancel()
          }
        })
        .finally(() => {
          setSending(false)
        })
    },
    [phoneNumber, onSuccess, onCancel]
  )

  const onConfirm = useCallback(() => {
    onCodeComplete(code)
  }, [code, onCodeComplete])

  useEffect(() => {
    if (code.length === CodeLength) {
      onCodeComplete(code)
    }
  }, [code, onCodeComplete])

  useEffect(() => {
    inputRef?.current?.focus()
  }, [])

  return (
    <>
      <ModalBody fontSize='lg' mb={6} mt={4}>
        <VStack align='start' spacing={6}>
          <CodeText />
          <VStack w='100%'>
            <HStack w='100%'>
              <Input
                ref={inputRef}
                placeholder='Code'
                size='lg'
                autoFocus={true}
                type='tel'
                autoComplete='one-time-code'
                inputMode='numeric'
                isDisabled={isSending}
                isInvalid={codeEntryError}
                onChange={onCodeChange}
                maxLength={4}
                minLength={4}
                textAlign='center'
                w='full'
              />
            </HStack>
            {!codeEntryError ? (
              <Text fontSize='sm' color='gray.300'>
                Didn&apos;t receive the code?&nbsp;
                <Link onClick={onCancel} textDecoration='underline'>
                  Try again
                </Link>
              </Text>
            ) : null}
            {codeEntryError ? (
              <Text fontSize='sm' color='gray.300'>
                Incorrect code entered.&nbsp;
                <Link onClick={onCancel} textDecoration='underline'>
                  Try again
                </Link>
              </Text>
            ) : null}
          </VStack>
          <Button
            variant='primary'
            size='lg'
            onClick={onConfirm}
            loadingText='Confirming&hellip;'
            isLoading={isSending}
            isDisabled={code.length !== CodeLength}
            width='100%'
          >
            Confirm
          </Button>
        </VStack>
      </ModalBody>
    </>
  )
}

const CodeText = () => (
  <Text fontSize='md'>
    A text message with a code was just sent to your phone. Enter that code
    below.
  </Text>
)

export default CodeEntry
