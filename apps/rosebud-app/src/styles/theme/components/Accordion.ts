import { accordionAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(accordionAnatomy.keys)

const baseStyle = definePartsStyle({
  // define the part you're going to style
  container: {
    bg: 'transparent',
    border: 0,
    padding: 0,
    _notLast: {
      borderBottom: '1px solid',
      borderBottomColor: 'gray.200',
    },
  },
  button: {
    p: 3,
    justifyContent: 'space-between',
  },
  panel: {
    p: 4,
    fontSize: '17px',
    bg: 'white',
  },
})

const accordionTheme = defineMultiStyleConfig({ baseStyle })
export default accordionTheme
