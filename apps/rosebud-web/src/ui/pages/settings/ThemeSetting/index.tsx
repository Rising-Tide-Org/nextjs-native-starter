import { VStack } from '@chakra-ui/react'
import ThemeSelector from 'ui/shared/ThemeSelector'

const ThemeSetting = () => {
  return (
    <VStack w='100%' align='start'>
      <ThemeSelector />
    </VStack>
  )
}

export default ThemeSetting
