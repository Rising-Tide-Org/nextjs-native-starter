import {
  Modal,
  ModalContent,
  ModalHeader,
  Text,
  useToast,
  Flex,
  ModalOverlay,
  ModalBody,
  Box,
  useDisclosure,
} from '@chakra-ui/react'
import Analytics from 'lib/analytics'
import { useCallback, useEffect } from 'react'

import MakeToast from 'ui/core/MakeToast'
import { useUserProvider } from 'providers/UserProvider'
import { UserFlag } from 'types/User'
import { captureException as sentryCaptureException } from '@sentry/nextjs'
import SignUpForm from 'ui/pages/signup/SignUpForm'
import TopBar from 'ui/global/TopBar'
import { ReferralConversionStage } from 'constants/referral'
import { useReferralConversion } from 'shared/hooks/useReferralConversion'

const SignUpModal = () => {
  const triggerReferralStage = useReferralConversion()
  const { setUserFlag, user } = useUserProvider()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    Analytics.trackEvent('signUpModal.view')
    onOpen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFinishSignUp = useCallback(() => {
    try {
      return setUserFlag(UserFlag.signUpCTADismissed, true)
    } catch (error) {
      sentryCaptureException(error)
    } finally {
      onClose()
    }
  }, [onClose, setUserFlag])

  const handleComplete = useCallback(async () => {
    await handleFinishSignUp()
    await triggerReferralStage(
      ReferralConversionStage.signup,
      user.referredByCode
    )
    Analytics.trackEvent('signUpModal.signUp.success')
  }, [handleFinishSignUp, triggerReferralStage, user.referredByCode])

  const handleError = async (message: string) => {
    Analytics.trackEvent('signUpModal.signUp.error', { error: message })

    toast(
      MakeToast({
        title: message,
        status: 'error',
      })
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      preserveScrollBarGap
      closeOnEsc={false}
      closeOnOverlayClick={false}
      motionPreset='slideInBottom'
      autoFocus={true}
      scrollBehavior='inside'
      size={{ base: 'full', md: 'md' }}
    >
      <ModalOverlay />
      <ModalContent
        overflow='hidden'
        border={0}
        rounded={{ base: 0, md: 'lg' }}
      >
        <ModalHeader alignItems='center' w='full' p={0}>
          <Flex justifyContent='space-between' flexDir='row' align='center'>
            <TopBar title='🔐 Create your account' hideBackButton />
          </Flex>
        </ModalHeader>
        <ModalBody
          overflow='hidden'
          rounded={{ base: 0, md: 'lg' }}
          pt={6}
          px={0}
          pb={0}
        >
          <Text px={{ base: 4, md: 6 }} pb={6}>
            To continue, create a free account for secure, encrypted access to
            your journal from any device.
          </Text>

          <Box px={{ base: 4, md: 6 }}>
            <SignUpForm onComplete={handleComplete} onError={handleError} />
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default SignUpModal
