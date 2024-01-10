import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  VStack,
  ModalCloseButton,
  Icon,
  Button,
  useToast,
  ModalHeader,
} from '@chakra-ui/react'
import { useEffect, useMemo, useState, ChangeEvent } from 'react'
import TopBar from 'ui/global/TopBar'
import { createRecord } from 'db/mutate'
import Analytics from 'lib/analytics'
import { Personalization } from 'types/Personalization'
import { useUserProvider } from 'providers/UserProvider'
import useFetchOne from 'hooks/useFetchOne'
import MakeToast from 'ui/core/MakeToast'
import { RbConfig } from 'ui/shared/Icon'
import { kDefaultPersonalizationId } from 'constants/defaults'
import BioPopoverContent from 'ui/core/PersonalizationTipsPopover/BioPopoverContent'
import ToneAndStylePopoverContent from 'ui/core/PersonalizationTipsPopover/ToneAndStylePopoverContent'
import PersonalizationTextarea from 'ui/core/PersonalizationTextarea'

type Props = {
  isOpen: boolean
  onClose: () => void
}

const kBioMaxLength = 500
const kToneAndStyleMaxLength = 500

const PersonalizationModal = ({ isOpen, onClose }: Props) => {
  const [bio, setBio] = useState('')
  const [bioError, setBioError] = useState(false)
  const [toneAndStyle, setToneAndStyle] = useState('')
  const [toneAndStyleError, setToneAndStyleError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user, updateUserFields } = useUserProvider()
  const toast = useToast()

  const { data: rosebudPersonalization } = useFetchOne<Personalization>(
    'personalizations',
    kDefaultPersonalizationId
  )

  useEffect(() => {
    Analytics.trackEvent('personalization.modal.view')
  }, [])

  useEffect(() => {
    if (user.profile?.bio) {
      setBio(user.profile.bio)
    }
  }, [user])

  useEffect(() => {
    if (rosebudPersonalization?.toneAndStyle) {
      setToneAndStyle(rosebudPersonalization.toneAndStyle)
    }
  }, [rosebudPersonalization])

  const handleBioChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setBioError(text.length > kBioMaxLength)
    setBio(text)
  }

  const handleToneAndStyleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setToneAndStyleError(text.length > kToneAndStyleMaxLength)
    setToneAndStyle(text)
  }

  const isSaveButtonDisabled = useMemo(() => {
    if (bioError || toneAndStyleError) {
      return true
    }

    return (
      user.profile?.bio === bio &&
      toneAndStyle === rosebudPersonalization?.toneAndStyle
    )
  }, [
    bioError,
    bio,
    user,
    toneAndStyleError,
    toneAndStyle,
    rosebudPersonalization,
  ])

  const handleSave = async () => {
    setIsLoading(true)

    Analytics.trackEvent('personalization.save', {
      personalization: kDefaultPersonalizationId,
      toneAndStyle,
    })

    try {
      // Only update the user's bio if it has changed
      if (user.profile?.bio !== bio) {
        await updateUserFields({ 'profile.bio': bio })
      }

      // Only create a new record if the toneAndStyle has changed
      if (toneAndStyle !== rosebudPersonalization?.toneAndStyle) {
        await createRecord(
          'personalizations',
          { toneAndStyle },
          kDefaultPersonalizationId
        )

        // Set the personalizationId on the user settings
        // This will be used to determine which personalization (if any) to use
        await updateUserFields({
          'settings.personalizationId':
            toneAndStyle.length > 0 ? kDefaultPersonalizationId : null,
        })
      }

      Analytics.trackEvent('personalization.save.success', {
        personalization: kDefaultPersonalizationId,
        toneAndStyle,
      })

      toast(
        MakeToast({
          title: 'Personalization saved',
          status: 'success',
        })
      )

      onClose()
    } catch (e) {
      Analytics.trackEvent('personalization.save.error', {
        personalization: kDefaultPersonalizationId,
        toneAndStyle,
        error: e.message,
      })

      toast(
        MakeToast({
          title: 'Unable to save personalization',
          status: 'error',
        })
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = async () => {
    Analytics.trackEvent('personalization.modal.close')
    onClose()
  }

  // Dont' show the modal until we have the personalization data
  if (rosebudPersonalization === undefined) {
    return null
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      preserveScrollBarGap
      closeOnOverlayClick={false}
      motionPreset='slideInBottom'
      autoFocus={true}
      scrollBehavior='inside'
      size={{ base: 'full', md: 'md' }}
      isCentered
    >
      <ModalOverlay />

      <ModalContent rounded='md' overflow='hidden'>
        <ModalHeader p={0}>
          <TopBar
            title='Personalize Rosebud'
            icon={<Icon as={RbConfig} boxSize={5} />}
            hideBackButton
          />
        </ModalHeader>
        <ModalBody p={0}>
          <ModalCloseButton />
          <VStack spacing={6} align='stretch' px={5} pt={2} pb={5}>
            <PersonalizationTextarea
              title='Your bio'
              placeholder='What should Rosebud know about you?'
              popoverContent={<BioPopoverContent />}
              value={bio}
              handleChange={handleBioChange}
              isError={bioError}
              maxInputLength={kBioMaxLength}
              data-sentry-block
            />
            <PersonalizationTextarea
              title='Tone & Style'
              placeholder="Describe how you'd like Rosebud to behave - tone, style and expertise."
              popoverContent={<ToneAndStylePopoverContent />}
              value={toneAndStyle}
              handleChange={handleToneAndStyleChange}
              isError={toneAndStyleError}
              maxInputLength={kToneAndStyleMaxLength}
            />
            <Button
              variant='primary'
              size='md'
              width={20}
              onClick={handleSave}
              isLoading={isLoading}
              isDisabled={isSaveButtonDisabled}
            >
              Save
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default PersonalizationModal
