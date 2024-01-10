import { mode } from '@chakra-ui/theme-tools'
import { ChakraStyledOptions } from '@chakra-ui/react'

const FormLabel = {
  baseStyle: (props: ChakraStyledOptions) => ({
    mb: 0,
    color: mode('brandGray.500', 'white')(props),
  }),
}

export default FormLabel
