import { Box, ChakraProps, Flex } from '@chakra-ui/react'
import {
  kGlobalLayoutWidth,
  kGlobalLayoutWidthNarrow,
  kTabBarTopPadding,
} from 'shared/ui/constants'
import GlobalTabNavigation from '../Navigation/GlobalTabNavigation'
import DesktopNavigationBar from '../Navigation/DesktopNavigationBar'
import BannerProductHunt from './BannerProductHunt'
import BannerSubscriptionIssue from './BannerSubscriptionIssue'
import useIsMobile from 'shared/hooks/useIsMobile'

type PageProps = ChakraProps & {
  children: React.ReactNode
  hideMenu?: boolean
  hideNav?: boolean
  hideMobileNav?: boolean
  hideDesktopNav?: boolean
  showHelp?: boolean
  isWide?: boolean
  isMobileFullHeight?: boolean
}

// Currently have a single layout for all pages
const Layout = ({
  children,
  hideMenu,
  hideNav,
  hideMobileNav,
  hideDesktopNav,
  showHelp,
  isWide,
  isMobileFullHeight,
  ...props
}: PageProps) => {
  const isMobile = useIsMobile()

  return (
    <Flex overflow='auto' w='full' h='full' direction='column'>
      {/* TODO these elements for theme */}
      <BannerSubscriptionIssue />
      <BannerProductHunt />
      {hideNav || hideDesktopNav || isMobile ? null : (
        <DesktopNavigationBar hideMenu={hideMenu} showHelp={showHelp} />
      )}
      <Box
        as='main'
        w='full'
        maxW={{
          base: '100%',
          md: isWide
            ? kGlobalLayoutWidth + 'px'
            : kGlobalLayoutWidthNarrow + 'px',
        }}
        m='0 auto'
        h='full'
        {...props}
      >
        <Flex
          position={{ base: 'initial', md: 'relative' }}
          h={{ base: isMobileFullHeight ? 'full' : 'auto', md: 'full' }}
          direction='column'
          w='full'
        >
          {children}
          {/* To account for tab navigation bar at the bottom */}
          {!hideMobileNav && !hideNav && isMobile && (
            <Box h={kTabBarTopPadding} />
          )}
        </Flex>
      </Box>
      {!(hideNav || hideMobileNav) && isMobile && <GlobalTabNavigation />}
    </Flex>
  )
}

export default Layout
