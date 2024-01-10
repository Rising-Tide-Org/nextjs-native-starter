import { tabsAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'
import { mode, StyleFunctionProps } from '@chakra-ui/theme-tools'

// import utility to set light and dark mode props

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(tabsAnatomy.keys)

// define a custom variant
const toggleVariant = definePartsStyle((props) => {
  return {
    tab: {
      border: '1px solid',
      borderColor: 'transparent',
      borderTopRadius: 'md',
      borderBottom: 'none',

      color: 'brandGray.700',
      bg: mode('white', 'brandGray.800')(props),
      _selected: {
        color: mode('brandGray.800', 'white')(props),
        fontWeight: 500,
        borderColor: 'inherit',
        borderBottom: 'none',
        mb: '-1px',
      },
    },
    tablist: {
      position: 'relative',
    },
    tabpanel: {
      border: '1px solid',
      borderColor: 'inherit',
      borderBottomRadius: 'md',
      borderTopRightRadius: 'md',
      _notFirst: {
        borderTopLeftRadius: 'md',
      },
    },
  }
})

const baseStyle = (props: StyleFunctionProps) => ({
  tab: {
    fontSize: '15px',

    color: 'brandGray.500',
    _selected: {
      color: mode('brandGray.800', 'brandGray.200')(props),
      borderBottom: '2px solid',
    },
    '&:not(_selected)': {
      color: 'brandGray.500',
    },
  },
  tablist: {
    px: 0,
    gap: 6,
  },
})

const variants = {
  toggle: toggleVariant,
}

// export the component theme
const tabsTheme = defineMultiStyleConfig({ baseStyle, variants })

export default tabsTheme
