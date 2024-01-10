import { extendTheme, theme as defaultTheme } from '@chakra-ui/react'
import colors from './colors'
import semanticTokens from './semanticTokens'
import Accordion from './components/Accordion'
import Button from './components/Button'
import FormLabel from './components/FormLabel'
import Link from './components/Link'
import Menu from './components/Menu'
import Panel from './components/Panel'
import Tabs from './components/Tabs'
import Text from './components/Text'
import Input from './components/Input'
import styles from './styles'
import Modal from './components/Modal'
import Flex from './components/Flex'

export const breakpoints = {
  xs: 320,
  sm: 400,
  md: 768,
  lg: 960,
  xl: 1200,
  '2xl': 1536,
  xxl: 2048,
}

const theme = extendTheme({
  config: {
    // System sets initial value.
    // App subscribes to system color mode changes.
    initialColorMode: 'system',
    useSystemColorMode: true,
  },
  breakpoints,
  colors,
  styles,
  semanticTokens,
  components: {
    Accordion,
    Button,
    FormLabel,
    Link,
    Menu,
    Panel,
    Tabs,
    Text,
    Input,
    Flex,
    Modal,
  },
  zIndices: {
    ...defaultTheme.zIndices,
    pushed: 20,
  },
})

/**
 * @see https://chakra-ui.com/docs/theming/theme
 *
 * Default zIndices:
 *
 *  hide: -1,
 *  auto: 'auto',
 *  base: 0,
 *  docked: 10,
 *  dropdown: 1000,
 *  sticky: 1100,
 *  banner: 1200,
 *  overlay: 1300,
 *  modal: 1400,
 *  popover: 1500,
 *  skipLink: 1600,
 *  toast: 1700,
 *  tooltip: 1800,
 */

export default theme
