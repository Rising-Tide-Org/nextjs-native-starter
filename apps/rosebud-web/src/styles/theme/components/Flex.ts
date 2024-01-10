import { mode } from '@chakra-ui/theme-tools'
import { ChakraStyledOptions } from '@chakra-ui/react'

// TODO assess if works
const Flex = {
  baseStyle: (props: ChakraStyledOptions) => ({
    borderColor: mode('brandGray.100', 'brandGray.500')(props),
  }),
  variants: {
    card: (props: ChakraStyledOptions) => ({
      bg: mode('white', 'brand.900')(props),
    }),
  },
}

export default Flex
