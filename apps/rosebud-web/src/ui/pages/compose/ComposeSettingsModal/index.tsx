import { JournalMode } from 'types/User'
import TopBar from 'ui/global/TopBar'
import DrawerOrModal from 'ui/shared/modals/DrawerOrModal'
import { useMemo, useState } from 'react'
import {
  Box,
  VStack,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react'
import { RbModeFocused, RbModeInteractive } from 'ui/shared/Icon'
import { useUserProvider } from 'providers/UserProvider'
import Analytics from 'lib/analytics'
import SettingOption from './SettingOption'
import DatePicker from 'ui/core/DatePicker'
import { useRouter } from 'next/router'
import moment from 'moment'
import { formatToHumanReadableDate } from 'util/date'
import { BsCalendar } from 'react-icons/bs'
import SmallCapsHeading from 'ui/core/SmallCapsHeading'

type Props = {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
  journalMode: JournalMode
  hideDate?: boolean
}

const ComposeModeSelector = ({
  isOpen,
  onOpen,
  onClose,
  journalMode,
  hideDate,
}: Props) => {
  const router = useRouter()
  const { updateUserFields } = useUserProvider()
  const [selectedOption, setSelectedOption] = useState<JournalMode>(journalMode)

  const handleSelect = (option: JournalMode) => {
    Analytics.trackEvent('compose.settings.journalMode.set', {
      mode: option,
      source: 'modal',
    })
    setSelectedOption(option)
    updateUserFields({ 'settings.journalMode': option })
    onClose?.()
  }

  const handleDateSelect = (date?: string) => {
    const { pathname, query }: any = router
    const params = new URLSearchParams(query)
    if (date) {
      params.set('day', moment(date).format('YYYY-MM-DD'))
      router.replace({ pathname, query: params.toString() }, undefined, {
        shallow: true,
      })
    }
  }

  const formattedDate = useMemo(
    () =>
      router.query?.day
        ? formatToHumanReadableDate(router.query?.day as string)
        : formatToHumanReadableDate(),
    [router.query?.day]
  )

  return (
    <DrawerOrModal
      isOpen={isOpen}
      onClose={onClose}
      onOpen={onOpen}
      isCentered={true}
    >
      <TopBar title='Entry settings' hideBackButton />
      <Box overflowY='auto' m='0 auto'>
        <Flex direction='column' gap={2}>
          <VStack align='start' spacing={2} w='full' p={4}>
            <SettingOption
              title='Focused'
              description='Journal prompts only'
              isSelected={selectedOption === 'focused'}
              onClick={() => handleSelect('focused')}
              icon={<RbModeFocused boxSize='18px' />}
            />
            <SettingOption
              title='Interactive'
              description='Conversationally guided journaling'
              isSelected={selectedOption === 'interactive'}
              onClick={() => handleSelect('interactive')}
              icon={<RbModeInteractive boxSize='18px' />}
            />
          </VStack>

          {hideDate ? null : (
            <>
              <VStack align='start' spacing={0} w='full' p={4}>
                <SmallCapsHeading>Entry date</SmallCapsHeading>
                <DatePicker
                  value={router.query?.day as string}
                  closeOnChange
                  onChange={handleDateSelect}
                  disabled={[(day: Date) => day.getTime() > Date.now()]}
                >
                  <InputGroup size='md' cursor='pointer'>
                    <Input
                      border='1px solid'
                      borderColor='inherit'
                      borderWidth={1}
                      pr='40px'
                      fontWeight={500}
                      readOnly
                      value={formattedDate}
                      cursor='pointer'
                    />
                    <InputRightElement cursor='pointer'>
                      <BsCalendar fill='gray' />
                    </InputRightElement>
                  </InputGroup>
                </DatePicker>
              </VStack>
            </>
          )}
        </Flex>
      </Box>
    </DrawerOrModal>
  )
}

export default ComposeModeSelector
