import { Badge, Flex, useColorModeValue } from '@chakra-ui/react'
import { ComponentProps } from 'react'
import { FiChevronRight } from 'react-icons/fi'
import MotionBox from 'ui/core/MotionBox'

type Props = ComponentProps<typeof MotionBox> & {
  style?: 'chevron' | 'check'
  icon?: React.ReactNode
  isSelected?: boolean
  isPremium?: boolean
  isDisabled?: boolean
  onSelect?: () => void
}

export const ListItem = ({
  children,
  icon,
  style = 'chevron',
  isDisabled = false,
  isPremium = false,
  onSelect,
  ...props
}: Props) => {
  const textColor = useColorModeValue('brandGray.900', 'white')
  const iconColor = useColorModeValue('brandGray.700', 'white')

  return (
    <MotionBox
      border='1px solid'
      borderColor='inherit'
      _hover={{ base: {}, md: { borderColor: 'inherit' } }}
      px={3}
      h='48px'
      w='full'
      rounded='md'
      fontSize='15px'
      lineHeight='1.33'
      fontWeight={500}
      color={iconColor}
      display='flex'
      alignItems='center'
      justifyContent='space-between'
      gap={2}
      bg='bg'
      cursor={isDisabled ? 'not-allowed' : 'pointer'}
      onClick={() => !isDisabled && onSelect?.()}
      {...props}
    >
      <Flex align='center' gap={2} color={textColor}>
        {icon}
        {children}
      </Flex>

      {style === 'chevron' && !isDisabled && !isPremium && <FiChevronRight />}
      {isPremium && (
        <Badge fontSize='11px' color='brand.500' variant='unstyled'>
          Premium
        </Badge>
      )}
    </MotionBox>
  )
}

export default ListItem
