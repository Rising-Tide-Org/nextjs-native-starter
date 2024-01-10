import { mode } from '@chakra-ui/theme-tools'
import { ChakraStyledOptions } from '@chakra-ui/react'

const Text = {
  variants: {
    secondary: (props: ChakraStyledOptions) => ({
      color: mode('brandGray.500', 'white')(props),
    }),
    tertiary: {
      color: 'brandGray.500',
    },
    highlight: (props: ChakraStyledOptions) => ({
      color: mode('blue.600', 'blue.300')(props),
    }),
  },
}

export default Text
