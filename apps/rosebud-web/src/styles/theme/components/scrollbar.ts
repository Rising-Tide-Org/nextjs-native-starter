import { ColorMode } from '@chakra-ui/react'
import colors from '../colors'

const scrollBarCss = (mode: ColorMode) => {
  const scrollbarColor = mode === 'light' ? colors.gray[300] : colors.gray[600]
  const scrollbarHoverColor =
    mode === 'light' ? colors.gray[300] : colors.gray[500]
  const backgroundColor = mode === 'light' ? colors.gray[100] : colors.gray[800]
  return {
    '&::-webkit-scrollbar': {
      // vertical scrollbar
      width: '6px',
      // horizontal scrollbar
      height: '6px',
    },
    '&:hover::-webkit-scrollbar-corner': {
      background: backgroundColor,
    },
    '&:hover::-webkit-scrollbar-thumb': {
      background: scrollbarColor,
      borderRadius: '4px',
    },
    '&:hover::-webkit-scrollbar-thumb: hover': {
      background: scrollbarHoverColor,
    },
    '&::-webkit-scrollbar-track': {
      opacity: 0,
    },
    '&::-webkit-scrollbar-corner': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'transparent',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb: hover': {
      background: 'transparent',
    },
  }
}

export const hiddenScrollBarCss = (): any => {
  return {
    '&': {
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    },
    '&::-webkit-scrollbar': {
      width: 0,
      height: 0,
    },
  }
}

export default scrollBarCss
