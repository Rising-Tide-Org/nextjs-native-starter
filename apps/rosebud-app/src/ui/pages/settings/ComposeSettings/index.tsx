import { VStack } from '@chakra-ui/react'
import Analytics from 'lib/analytics'
import { useUserProvider } from 'providers/UserProvider'
import { useState } from 'react'
import { JournalMode } from 'types/User'
import SettingOption from 'ui/pages/compose/ComposeSettingsModal/SettingOption'
import { RbModeFocused, RbModeInteractive } from 'ui/shared/Icon'

type Props = {
  journalMode: JournalMode
}

const ComposeSettings = ({ journalMode }: Props) => {
  const { updateUserFields } = useUserProvider()
  const [selectedOption, setSelectedOption] = useState<JournalMode>(journalMode)

  const handleSelect = (option: JournalMode) => {
    Analytics.trackEvent('compose.settings.journalMode.set', {
      mode: option,
      source: 'settings',
    })
    setSelectedOption(option)
    updateUserFields({ 'settings.journalMode': option })
  }

  return (
    <>
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
    </>
  )
}

export default ComposeSettings
