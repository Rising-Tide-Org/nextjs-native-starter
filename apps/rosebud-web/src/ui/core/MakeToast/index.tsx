import {
  Box,
  CloseButton,
  useColorModeValue,
  UseToastOptions,
  Text,
  Flex,
} from '@chakra-ui/react'
import { useMemo } from 'react'
import { HiCheckCircle } from 'react-icons/hi2'
import { MdError, MdInfo, MdWarning } from 'react-icons/md'
import theme from 'styles/theme'

type Props = {
  onClose: () => void
} & UseToastOptions

const MakeToast = ({ title, description, status, onClose }: Props) => {
  const backgroundColor = useColorModeValue('brandGray.900', 'brand.900')
  const closeHoverColor = useColorModeValue('gray.600', 'gray.500')
  const descriptionColor = useColorModeValue('brandGray.300', 'brandGray.500')
  const borderColor = useColorModeValue('white', 'border')

  const icon = useMemo(() => {
    switch (status) {
      case 'error':
        return <MdError size={24} fill={theme.colors.red[500]} />
      case 'warning':
        return <MdWarning size={24} fill={theme.colors.yellow[500]} />
      case 'success':
        return <HiCheckCircle size={24} fill={theme.colors.green[500]} />
      case 'info':
        return <MdInfo size={24} fill={theme.colors.blue[500]} />
      default:
        return null
    }
  }, [status])

  return (
    <Box
      bg={backgroundColor}
      pl={3}
      pr={1}
      py={3}
      rounded='lg'
      position='relative'
      overflow='hidden'
      shadow='sm'
      maxW='300px'
      border='1px solid'
      borderColor={borderColor}
      mx={2}
      mb={-2}
    >
      <Flex justify='space-between' align='top'>
        <Flex minH='24px' align='top' gap={2}>
          {icon}
          <Flex minH='24px' justify='center' direction='column' gap='2px'>
            <Text fontWeight={600} fontSize='15px' color='white'>
              {title}
            </Text>
            {description && (
              <Text fontSize='14px' color={descriptionColor} mb='2px'>
                {description}
              </Text>
            )}
          </Flex>
        </Flex>
        <CloseButton
          onClick={onClose}
          size='sm'
          color='gray.400'
          _hover={{ color: closeHoverColor, bg: 'transparent' }}
        />
      </Flex>
    </Box>
  )
}

const ToastOptions = (props: UseToastOptions): UseToastOptions => {
  const options: UseToastOptions = {
    position: 'top',
    duration: 3000,
    isClosable: true,
    status: 'success',
    ...props,
  }

  return {
    render: ({ onClose }) => <MakeToast onClose={onClose} {...options} />,
    ...options,
  }
}

export default ToastOptions
