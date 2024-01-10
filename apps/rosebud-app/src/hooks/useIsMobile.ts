import { Capacitor } from '@capacitor/core'
import { useMediaQuery, useTheme } from '@chakra-ui/react'

const useIsMobile = () => {
  const isNative = Capacitor.isNativePlatform()

  const theme = useTheme()
  const [isMobile] = useMediaQuery(`(max-width: ${theme.breakpoints.md}px)`, {
    ssr: !isNative,
    fallback: false,
  })

  return isMobile
}

export default useIsMobile
