import {
  Flex,
  Link,
  Text,
  Button,
  LinkOverlay,
  Box,
  Image,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import routes from 'lib/routes'
import NavHamburgerMenu from 'ui/global/Navigation/NavHamburgerMenu'
import { useUserProvider } from 'providers/UserProvider'
import GlobalTabNavigation from '../GlobalTabNavigation'
import { useRouter } from 'next/router'
import DesktopNavContainer from './DesktopNavContainer'
import { RbPencil } from 'ui/shared/Icon'
import HelpButton from 'ui/shared/HelpButton'
import { useSubscriptionProvider } from 'providers/SubscriptionProvider'
import DesktopNavGiftButton from './DesktopNavGiftButton'
import { useLifemapProvider } from 'providers/LifemapProvider'

type Props = {
  hideMenu?: boolean
  showHelp?: boolean
}

const DesktopNav = ({ hideMenu, showHelp }: Props) => {
  const { user } = useUserProvider()
  const router = useRouter()
  const { subscriptionTier, subscriptionTierName } = useSubscriptionProvider()
  const { colorMode } = useColorMode()
  const { isAvailable: showReviewCTA } = useLifemapProvider()
  const reviewButtonBgColor = useColorModeValue('#F5D47D', 'bloom.600')

  return (
    <DesktopNavContainer>
      <Flex align="center" px={1} gap={2} flexShrink={0}>
        <Link as={NextLink} href={routes.default} passHref>
          {/* TODO need to adjust logo */}
          <Image
            width={100}
            height={24}
            src={
              colorMode === 'dark' ? '/logo-type-light.svg' : '/logo-type.svg'
            }
            alt="Rosebud logo"
          />
        </Link>
        <Text
          color={subscriptionTier === 'bloom' ? 'bloom.600' : 'brand.400'}
          textTransform="lowercase"
        >
          {subscriptionTierName ?? 'beta'}
        </Text>
      </Flex>
      {!hideMenu && user ? (
        <>
          <GlobalTabNavigation />
          <Flex align="center" gap={1}>
            {showReviewCTA ? (
              <Box
                position="relative"
                pr={1}
                display={{ base: 'none', md: 'block' }}
              >
                <LinkOverlay
                  as={NextLink}
                  href={routes.review}
                  passHref
                  shallow
                >
                  <Button
                    backgroundColor={reviewButtonBgColor}
                    backgroundSize="cover"
                    size="sm"
                    position="relative"
                    overflow="hidden"
                    _active={{
                      backgroundColor: { reviewButtonBgColor },
                    }}
                    _before={{
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundImage: 'url(images/doodles/stars.svg)',
                      backgroundSize: 'cover',
                      backgroundRepeat: 'no-repeat',
                      transition: 'transform 0.3s ease',
                    }}
                    _hover={{
                      _before: {
                        transform: 'rotate(5deg) scale(1.6)',
                      },
                    }}
                  >
                    2023 in Review
                  </Button>
                </LinkOverlay>
              </Box>
            ) : null}
            <Box
              position="relative"
              pr={2}
              display={{ base: 'none', md: 'block' }}
            >
              <LinkOverlay
                as={NextLink}
                href={routes.compose(router.asPath)}
                passHref
                shallow
              >
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<RbPencil boxSize="14px" />}
                >
                  Write
                </Button>
              </LinkOverlay>
            </Box>
            <DesktopNavGiftButton />
            <NavHamburgerMenu />
          </Flex>
        </>
      ) : null}
      {showHelp ? <HelpButton /> : null}
    </DesktopNavContainer>
  )
}

export default DesktopNav
