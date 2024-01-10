import { StyleFunctionProps } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'

const styles = {
  global: (props: StyleFunctionProps) => ({
    html: {
      fontSize: '16px',
    },
    body: {
      fontFamily: 'Circular Std, system-ui, sans-serif',
      // For light mode we use light rose color
      background: mode('brandGray.100', 'brandGray.900')(props),
      color: mode('gray.800', 'white.900')(props),
    },
    // TODO A hack to remove a flickering box shadow from the menu components in dark theme
    '.chakra-menu__menu-list': {
      boxShadow: 'none !important',
    },
  }),
}

export default styles
