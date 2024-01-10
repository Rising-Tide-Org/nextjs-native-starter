import { HStack, Text, Icon, BoxProps } from '@chakra-ui/react'
import { PiWarningOctagonBold } from 'react-icons/pi'

const WarningCard = ({ children, ...props }: BoxProps) => {
  return (
    <HStack
      spacing={4}
      bg='yellow.50'
      rounded='md'
      p={4}
      border='1px solid'
      borderColor='yellow.500'
      alignContent={'center'}
      {...props}
    >
      <Icon as={PiWarningOctagonBold} w={6} h={6} color='yellow.900' />
      <Text color='yellow.900' fontWeight={500}>
        {children}
      </Text>
    </HStack>
  )
}

export default WarningCard
