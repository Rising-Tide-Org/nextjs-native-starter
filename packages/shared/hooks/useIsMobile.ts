import { useMediaQuery, useTheme } from '@chakra-ui/react'

const useIsMobile = () => {
  const theme = useTheme()
  const [isMobile] = useMediaQuery(`(max-width: ${theme.breakpoints.md}px)`, {
    ssr: true,
    fallback: false,
  })

  return isMobile
}

export default useIsMobile
