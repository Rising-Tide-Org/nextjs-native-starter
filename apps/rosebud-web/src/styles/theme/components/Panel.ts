import { mode } from '@chakra-ui/theme-tools'
import { ChakraStyledOptions } from '@chakra-ui/react'

const Panel = {
  baseStyle: (props: ChakraStyledOptions) => ({
    border: '1px solid',
    borderColor: mode('brandGray.200', 'transparent')(props),
    bg: mode('white', 'bg')(props),
    p: 4,
    rounded: 'md',
    w: 'full',
  }),
  variants: {
    vstack: {
      display: 'flex',
      flexDirection: 'column',
    },
    hstack: {
      display: 'flex',
      flexDirection: 'row',
    },
  },
}

export default Panel
