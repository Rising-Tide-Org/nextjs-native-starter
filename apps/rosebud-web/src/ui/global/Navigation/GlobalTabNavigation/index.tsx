import NextLink from 'next/link'
import {
  Box,
  Button,
  Circle,
  Flex,
  LinkOverlay,
  ResponsiveValue,
  Text,
  useColorModeValue,
  useTheme,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import routes from 'lib/routes'
import {
  RbEntries,
  RbExplore,
  RbPencil,
  RbSettings,
  RbSun,
} from 'ui/shared/Icon'
import {
  kGlobalLayoutWidthNarrow,
  kiOSBottomPadding,
  kTabBarHeightMobile,
  kViewPadding,
} from 'shared/ui/constants'
import { isIOS, isPWAInstalled } from 'util/device'

type Tab = {
  path: (path?: string) => string
  name?: string
  icon?: React.ElementType
  isWriteButton?: boolean
  isMobileOnly?: boolean
  isDesktopOnly?: boolean
  iconSize?: ResponsiveValue<string>
}

const tabs: Tab[] = [
  {
    name: 'Today',
    path: () => routes.home,
    icon: RbSun,
    iconSize: { base: '24px', md: '22px' },
  },
  {
    name: 'Explore',
    path: () => routes.library,
    icon: RbExplore,
    iconSize: { base: '24px', md: '22px' },
  },
  {
    path: (path?: string) => routes.compose(path),
    isWriteButton: true,
    isMobileOnly: true,
    iconSize: { base: '28px', md: '24px' },
  },
  {
    name: 'Entries',
    path: () => routes.journal,
    icon: RbEntries,
    iconSize: { base: '24px', md: '21px' },
  },
  {
    name: 'Settings',
    path: () => routes.settings,
    icon: RbSettings,
    isMobileOnly: true,
    iconSize: { base: '24px', md: '22px' },
  },
]

const kButtonSize = '66px'

const GlobalTabNavigation = () => {
  const theme = useTheme()
  const { asPath } = useRouter()
  const selectedColor = useColorModeValue('black.1000', 'white.900')
  const hoverColor = useColorModeValue('gray.500', 'gray.300')

  return (
    <Box
      position={{ base: 'fixed', md: 'relative' }}
      bottom={0}
      left={0}
      w='full'
      background='bg'
      pb={isPWAInstalled() && isIOS() ? kiOSBottomPadding : 0}
      h={{ base: 'initial', md: 'full' }}
      zIndex={theme.zIndices.docked}
      boxShadow={{ base: '0px -4px 10px rgba(0, 0, 0, 0.05)', md: 'none' }}
    >
      <Flex
        justifyContent={{ base: 'space-around', md: 'center' }}
        h={{ base: kTabBarHeightMobile, md: 'full' }}
        maxW={{ base: kGlobalLayoutWidthNarrow + 'px', md: 'auto' }}
        margin='auto'
        borderTop={{ base: '1px solid', md: 'none' }}
        borderColor='inherit'
        gap={{ base: 4, md: 7 }}
        px={kViewPadding}
        alignItems='stretch'
      >
        {tabs.map((tab, index) => {
          const tabPath = tab.path(asPath)
          const isSelected = asPath.startsWith(tabPath)

          return (
            <Flex
              key={index}
              borderBottomWidth='2px'
              borderBottomStyle='solid'
              borderBottomColor={{
                base: 'transparent',
                md: isSelected ? 'brand.500' : 'transparent',
              }}
              display={
                tab.isMobileOnly
                  ? { base: 'flex', md: 'none' }
                  : tab.isDesktopOnly
                  ? { base: 'none', md: 'flex' }
                  : 'flex'
              }
              mx={tab?.isWriteButton ? '-10px' : 0}
            >
              <Button
                variant='ghost'
                size='md'
                pb={0}
                px={0}
                fontWeight={500}
                _hover={{
                  background: 'none',
                }}
                alignSelf='center'
                role='group'
                disabled={isSelected}
                rounded='none'
                data-testid={`nav-tab-${tab.name}`}
              >
                <LinkOverlay
                  as={NextLink}
                  href={tabPath}
                  passHref
                  shallow
                  h='auto'
                  pt={{ base: 0, md: '3px' }}
                  display='inline-flex'
                  alignItems='center'
                  flexDir={{ base: 'column', md: 'row' }}
                  gap={1}
                >
                  {tab?.isWriteButton ? (
                    <Circle
                      bg='brand.500'
                      size={kButtonSize}
                      p={0}
                      rounded='full'
                      boxShadow='0px 4px 12px rgba(0, 0, 0, 0.15)'
                      mb='18px'
                    >
                      <RbPencil color='white' />
                    </Circle>
                  ) : (
                    <>
                      {tab.icon ? (
                        <Flex
                          color={isSelected ? selectedColor : 'gray.400'}
                          w='30px'
                          h='30px'
                          align='center'
                          justify='center'
                        >
                          <tab.icon
                            boxSize={tab.iconSize}
                            color='inherit'
                            _groupHover={
                              isSelected
                                ? {
                                    color: selectedColor,
                                  }
                                : {
                                    color: hoverColor,
                                  }
                            }
                          />
                        </Flex>
                      ) : null}
                      <Text
                        fontWeight={500}
                        color={isSelected ? selectedColor : 'gray.400'}
                        fontSize={{ base: '12px', md: '15px' }}
                        pr={{ base: 0, md: 2 }}
                        _groupHover={
                          isSelected
                            ? {
                                color: selectedColor,
                              }
                            : {
                                color: hoverColor,
                              }
                        }
                      >
                        {tab.name}
                      </Text>
                    </>
                  )}
                </LinkOverlay>
              </Button>
            </Flex>
          )
        })}
      </Flex>
    </Box>
  )
}

export default GlobalTabNavigation
