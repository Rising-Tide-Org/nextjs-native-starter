import {
  Button,
  Flex,
  Text,
  Icon,
  ChakraProps,
  Spinner,
  useColorMode,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { ReactNode, useCallback } from 'react'
import { FiChevronLeft } from 'react-icons/fi'
import { kTopBarHeight } from 'shared/ui/constants'
import theme from 'styles/theme'
import { useNavigationProvider } from 'shared/providers/NavigationProvider'

type Props = {
  title: string
  icon?: ReactNode
  rightAction?: ReactNode
  hideBackButton?: boolean
  isLoading?: boolean
  overlayEffect?: boolean
  onBack?: () => void
} & ChakraProps

const TopBar = ({
  title,
  icon,
  isLoading,
  rightAction,
  hideBackButton,
  overlayEffect,
  onBack,
  ...rest
}: Props) => {
  const { colorMode } = useColorMode()
  const { popView } = useNavigationProvider()
  const router = useRouter()
  const handleGoBack = useCallback(() => {
    if (popView) {
      popView()
      return
    }
    router.back()
  }, [popView, router])

  return (
    <Flex
      px={4}
      height={kTopBarHeight}
      position={overlayEffect ? 'sticky' : 'relative'}
      top={0}
      bg={
        colorMode === 'dark'
          ? 'brand.900'
          : overlayEffect
          ? 'rgba(255, 255, 255, 0.8)'
          : 'white'
      }
      borderBottom='1px solid'
      borderColor={colorMode === 'dark' ? 'inherit' : 'gray.100'}
      align='center'
      backdropFilter='blur(7px) saturate(180%)'
      justifyContent='space-between'
      alignItems='center'
      w='full'
      zIndex={overlayEffect ? theme.zIndices.sticky : 0}
      {...rest}
    >
      {hideBackButton ? null : (
        <Button
          variant='link'
          p={0}
          minW={'none'}
          pr={1}
          onClick={onBack ? onBack : handleGoBack}
          data-testid='top-bar-back-button'
        >
          <Icon as={FiChevronLeft} w={6} h={7} />
        </Button>
      )}
      {isLoading ? (
        <Flex>
          <Spinner size='sm' color='brand.500' />
        </Flex>
      ) : (
        <Flex gap={2} flex={1} align='center'>
          {icon}
          <Text alignSelf='center' fontWeight={500} fontSize='17px'>
            {title}
          </Text>
        </Flex>
      )}
      {rightAction}
    </Flex>
  )
}

export default TopBar
