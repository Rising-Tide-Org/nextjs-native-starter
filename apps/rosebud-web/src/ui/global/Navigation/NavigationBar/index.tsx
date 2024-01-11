import {
  Button,
  Flex,
  Text,
  Icon,
  ChakraProps,
  Spinner,
  useTheme,
  useColorModeValue,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { ReactNode, useCallback } from 'react'
import { FiChevronLeft } from 'react-icons/fi'
import { kNavBarHeightMobile } from 'ui/constants'
import { useNavigationProvider } from 'providers/NavigationProvider'
import NavHamburgerMenu from 'ui/global/Navigation/NavHamburgerMenu'
import useIsMobile from 'hooks/useIsMobile'
import NavigationBarGiftButton from './NavigationBarGiftButton'
import { useUserProvider } from 'providers/UserProvider'

export type NavigationBarProps = {
  title?: string | ReactNode
  icon?: ReactNode
  leftAction?: ReactNode
  rightAction?: ReactNode
  isLoading?: boolean
  overlayEffect?: boolean
  onBack?: () => void
  returnTo?: string
} & ChakraProps

const NavigationBar = ({
  title,
  icon,
  isLoading,
  leftAction,
  rightAction,
  overlayEffect = true,
  onBack,
  returnTo,
  ...props
}: NavigationBarProps) => {
  const overlayEffectColor = useColorModeValue(
    'rgba(255, 255, 255, 0.8)',
    'rgba(44,44,44, 0.8)'
  )
  const { popView, views } = useNavigationProvider()
  const { user } = useUserProvider()
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useIsMobile()
  const handleGoBack = useCallback(() => {
    if (popView) {
      popView()
      return
    }
    if (returnTo) {
      router.push(returnTo)
      return
    }
    router.back()
  }, [popView, returnTo, router])

  if (!isMobile) {
    return null
  }

  return (
    <Flex
      pl={4}
      pr={rightAction ? 1 : 4}
      height={kNavBarHeightMobile}
      position='sticky'
      top={0}
      bg={overlayEffect ? overlayEffectColor : 'bg'}
      borderBottom='1px solid'
      borderColor='inherit'
      align='center'
      backdropFilter='blur(7px) saturate(180%)'
      justifyContent='space-between'
      alignItems='center'
      w='full'
      zIndex={overlayEffect ? theme.zIndices.sticky : 0}
      {...props}
    >
      <Flex>
        {views.length > 1 || onBack || returnTo ? (
          <Button
            variant='link'
            p={0}
            minW={'none'}
            pr={1}
            onClick={onBack ? onBack : handleGoBack}
            data-testid='nav-bar-back-button'
          >
            <Icon as={FiChevronLeft} w={6} h={7} />
          </Button>
        ) : (
          <>
            {leftAction !== undefined ? (
              leftAction
            ) : user ? (
              <NavigationBarGiftButton />
            ) : null}
          </>
        )}
      </Flex>
      <Flex
        position='absolute'
        left={0}
        right={0}
        top={0}
        bottom={0}
        align='center'
        justify='center'
        zIndex={-1}
      >
        {isLoading ? (
          <Flex>
            <Spinner size='sm' color='brand.500' />
          </Flex>
        ) : (
          <Flex
            gap={2}
            flex={1}
            align='center'
            justify='center'
            h='full'
            fontWeight={500}
            fontSize='17px'
          >
            {icon}
            {typeof title === 'string' ? (
              <Text alignSelf='center'>{title}</Text>
            ) : (
              title
            )}
          </Flex>
        )}
      </Flex>
      <Flex>
        {rightAction !== undefined ? rightAction : <NavHamburgerMenu />}
      </Flex>
    </Flex>
  )
}

export default NavigationBar
