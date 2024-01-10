import { VStack } from '@chakra-ui/react'
import LanguageSelector from 'ui/shared/LanguageSelector'

const LanguageSetting = () => {
  return (
    <VStack w='100%' align='start'>
      <LanguageSelector />
    </VStack>
  )
}

export default LanguageSetting
