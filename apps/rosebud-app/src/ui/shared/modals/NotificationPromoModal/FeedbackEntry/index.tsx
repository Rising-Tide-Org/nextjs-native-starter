import {
  ModalBody,
  Text,
  VStack,
  Button,
  useToast,
  ButtonGroup,
  Checkbox,
  Textarea,
} from '@chakra-ui/react'
import Analytics from 'lib/analytics'
import { submitFeedback } from 'net/airtable'
import { useUserProvider } from 'providers/UserProvider'
import { ChangeEvent, useCallback, useMemo, useRef, useState } from 'react'
import { captureException } from '@sentry/nextjs'
import MakeToast from 'ui/core/MakeToast'

type Props = {
  onClose: () => void
  firstTime?: boolean
}

const FeedbackEntry = ({ onClose, firstTime = false }: Props) => {
  const { user } = useUserProvider()
  const [contactable, setContactable] = useState(true)
  const [feedback, setFeedback] = useState('')
  const [isSending, setSending] = useState(false)
  const submittedRef = useRef(false)
  const toast = useToast()

  const showContactable = useMemo(() => {
    return user?.phone && user?.phone?.length > 0
  }, [user])

  const onChangeContactable = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      setContactable(ev.target.checked)
    },
    []
  )

  const handleSubmitFeedback = useCallback(() => {
    // Do nothing if already sending, prevents double sent
    if (submittedRef.current) return
    submittedRef.current = true

    const utmCampaign = user.metadata?.utm_campaign

    Analytics.trackEvent('feedback.submit', {
      feedback,
      contactable,
      utmCampaign,
    })

    setSending(true)

    submitFeedback(
      feedback,
      user?.uuid,
      user?.phone,
      user?.email,
      showContactable ? contactable : false,
      utmCampaign
    )
      .then((resp) => {
        if (resp.error) {
          return Promise.reject(resp.error)
        } else {
          Analytics.trackEvent('feedback.submit.success', {
            feedback,
            contactable,
            utmCampaign,
          })
          toast(
            MakeToast({
              title: 'Feedback sent',
              description: 'Thank you for sharing your thoughts!',
              status: 'success',
            })
          )
          onClose()
        }
      })
      .catch((error) => {
        captureException(error)
        Analytics.trackEvent('feedback.submit.error', {
          feedback,
          contactable,
          utmCampaign,
          error: error.message,
        })
        setSending(false)
        toast(
          MakeToast({
            title: 'Something went wrong.',
            description: 'Try again, or submit feedback at another time.',
            status: 'error',
          })
        )
      })
      .finally(() => {
        setSending(false)
        submittedRef.current = false
      })
  }, [
    submittedRef,
    contactable,
    feedback,
    user?.uuid,
    user?.phone,
    user?.email,
    showContactable,
    user.metadata?.utm_campaign,
    toast,
    onClose,
  ])

  return (
    <ModalBody fontSize='lg' mb={6} mt={2}>
      <VStack align='start' spacing={6}>
        {!firstTime && (
          <Text fontSize='md'>
            We&apos;d love to hear what you think of Rosebud so far. What do you
            like? What could be improved?
          </Text>
        )}
        <Textarea
          border='1px solid'
          borderColor='inherit'
          p={2}
          pl={2}
          h='120px'
          _focus={{ borderColor: 'gray.600' }}
          placeholder='Be honest, we can take it!'
          _placeholder={{
            color: 'brandGray.500',
          }}
          onChange={(e) => setFeedback(e.target.value)}
        />
        {showContactable ? (
          <Checkbox
            defaultChecked={contactable}
            colorScheme='white'
            iconColor='brand.500'
            onChange={onChangeContactable}
          >
            Allow Rosebud team to follow up with you
          </Checkbox>
        ) : (
          <></>
        )}
        <ButtonGroup justifyContent='space-between' w='100%'>
          <Button
            variant='primary'
            size='lg'
            onClick={handleSubmitFeedback}
            loadingText='Sending&hellip;'
            isLoading={isSending}
            isDisabled={feedback.length === 0}
          >
            Send feedback
          </Button>
        </ButtonGroup>
      </VStack>
    </ModalBody>
  )
}

export default FeedbackEntry
