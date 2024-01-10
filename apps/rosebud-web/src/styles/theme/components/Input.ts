import { mode } from '@chakra-ui/theme-tools'
import { ChakraStyledOptions } from '@chakra-ui/react'

const Input = {
  baseStyle: (props: ChakraStyledOptions) => ({
    background: mode('white', 'bg')(props),
    _focus: {
      borderColor: mode('brandGray.500', 'brandGray.700')(props),
    },
  }),
  variants: {
    readonly: (props: ChakraStyledOptions) => ({
      background: mode('brandGray.100', 'brandGray.500')(props),
    }),
  },
}

export default Input
