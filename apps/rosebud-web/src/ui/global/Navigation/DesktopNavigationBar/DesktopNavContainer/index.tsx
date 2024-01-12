import { Box, Flex, useColorModeValue, useTheme } from '@chakra-ui/react'
import { kNavBarHeight, kNavBarHeightMobile, kViewPadding } from 'shared/ui/constants'

const NavLayoutContainer = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme()

  const boxShadow = useColorModeValue('none', '0px 4px 24px rgba(0, 0, 0, 0.8)')
  const borderBottom = useColorModeValue('1px solid', undefined)

  return (
    <Box
      bg='bg'
      w='full'
      borderBottom={borderBottom}
      borderColor='border'
      display={{ base: 'none', md: 'block' }}
      position='sticky'
      zIndex={theme.zIndices.sticky}
      top={0}
      boxShadow={boxShadow}
    >
      <Flex
        w='full'
        justify='space-between'
        mx='auto'
        px={kViewPadding}
        align='center'
        h={{ base: kNavBarHeightMobile, md: kNavBarHeight }}
      >
        {children}
      </Flex>
    </Box>
  )
}

export default NavLayoutContainer
