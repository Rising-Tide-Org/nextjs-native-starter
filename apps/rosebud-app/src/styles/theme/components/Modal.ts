import { mode } from '@chakra-ui/theme-tools'
import { ChakraStyledOptions } from '@chakra-ui/react'

const Modal = {
  baseStyle: (props: ChakraStyledOptions) => ({
    dialog: {
      bg: mode('white', 'brand.900')(props),
    },
  }),
}

export default Modal
