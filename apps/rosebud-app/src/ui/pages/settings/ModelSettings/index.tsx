import { Switch } from '@chakra-ui/react'
import { useUserProvider } from 'providers/UserProvider'
import { useCallback, useMemo } from 'react'
import { RbMemory } from 'ui/shared/Icon'
import Section from 'ui/pages/settings/Section'

const ModelSettings = () => {
  const { user, updateUserFields } = useUserProvider()

  const advancedModelEnabled = useMemo(
    () => user.settings.advancedModelEnabled !== false,
    [user.settings.advancedModelEnabled]
  )

  const toggleAdvancedModel = useCallback(
    async (enabled: boolean) => {
      await updateUserFields({
        'settings.advancedModelEnabled': enabled,
      })
    },
    [updateUserFields]
  )

  return (
    <Section
      title='Advanced AI'
      icon={<RbMemory boxSize='20px' />}
      pb={5}
      rightElement={
        <Switch
          colorScheme='brand'
          isChecked={advancedModelEnabled}
          onChange={(e) => toggleAdvancedModel(e.target.checked)}
        />
      }
    >
      <></>
    </Section>
  )
}

export default ModelSettings
