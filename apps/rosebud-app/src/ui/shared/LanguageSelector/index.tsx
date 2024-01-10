import { Select, useToast } from '@chakra-ui/react'
import { kLanguages } from 'l10n/languages'
import Analytics from 'lib/analytics'
import { useUserProvider } from 'providers/UserProvider'
import { useCallback } from 'react'
import MakeToast from 'ui/core/MakeToast'

const LanguageSelector = () => {
  const { user, updateUserFields } = useUserProvider()
  const toast = useToast()

  const handleChange = useCallback(
    async (event: React.ChangeEvent<HTMLSelectElement>) => {
      const language = event.target.value
      await updateUserFields({ 'settings.locale': language })
      toast(MakeToast({ title: 'Language updated', status: 'success' }))
      Analytics.trackEvent('settings.language.change', { language })
    },
    [toast, updateUserFields]
  )

  if (!user) {
    return null
  }

  return (
    <Select
      defaultValue={user.settings.locale}
      onChange={handleChange}
      w='fit-content'
      data-testid='language-selector'
    >
      {kLanguages.map((language) => (
        <option key={language.code} value={language.code}>
          {language.name}
        </option>
      ))}
    </Select>
  )
}

export default LanguageSelector
