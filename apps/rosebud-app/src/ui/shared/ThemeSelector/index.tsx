import { Select, useColorMode } from '@chakra-ui/react'
import { kLSAppPrefix } from 'constants/localStorage'
import Analytics from 'lib/analytics'
import { useLocalStorage } from 'usehooks-ts'

const themes = [
  { name: 'System', value: 'system' },
  { name: 'Light', value: 'light' },
  { name: 'Dark', value: 'dark' },
]

const localStorageKey = `${kLSAppPrefix}/user-selected-theme`

const ThemeSelector = () => {
  const { setColorMode } = useColorMode()
  // We are keeping a separate track of the theme in local storage so that we can
  // apply use system option as chakra converts it to dark or light right away
  const [lsTheme, setLsTheme] = useLocalStorage<string | undefined>(
    localStorageKey,
    undefined
  )

  const handleChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target

    Analytics.trackEvent('theme.change', {
      colorMode: value,
    })

    setLsTheme(value)
    setColorMode(value)
  }

  return (
    <Select
      defaultValue={undefined}
      value={lsTheme}
      onChange={handleChange}
      w='fit-content'
      data-testid='theme-selector'
    >
      {themes.map((theme) => (
        <option key={theme.name} value={theme.value}>
          {theme.name}
        </option>
      ))}
    </Select>
  )
}

export default ThemeSelector
