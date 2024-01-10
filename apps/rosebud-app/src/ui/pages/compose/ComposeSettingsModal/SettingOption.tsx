import {
  Box,
  Flex,
  Icon,
  Spacer,
  VStack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { RbCheckmark } from 'ui/shared/Icon'

const SettingOption = ({
  title,
  icon,
  description,
  isSelected,
  onClick,
}: {
  title: string
  icon?: React.ReactNode
  description: string
  isSelected: boolean
  onClick: () => void
}) => {
  const themeBorderColor = useColorModeValue('brandGray.300', 'brandGray.700')
  const themeBorderColorHover = useColorModeValue(
    'brandGray.400',
    'brandGray.600'
  )
  return (
    <Box
      w='100%'
      p={4}
      borderWidth={1}
      borderRadius='lg'
      borderColor={isSelected ? 'green.300' : themeBorderColor}
      cursor='pointer'
      _hover={{ borderColor: isSelected ? 'green.300' : themeBorderColorHover }}
      onClick={onClick}
    >
      <Box w='100%' textAlign='left'>
        <Flex direction='row' align='start'>
          <VStack align='start' spacing={1}>
            <Flex align='center' gap={2}>
              {icon}
              <Text fontSize='16px' fontWeight={500}>
                {title}
              </Text>
            </Flex>
            <Text pl='26px' fontSize='15px' variant='tertiary'>
              {description}
            </Text>
          </VStack>
          <Spacer />
          {isSelected && (
            <Icon as={RbCheckmark} boxSize='18px' color='teal.500' />
          )}
        </Flex>
      </Box>
    </Box>
  )
}

export default SettingOption
