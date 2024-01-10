import {
  Flex,
  Box,
  FlexProps,
  useColorModeValue,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react'
import { IoMdInformationCircle } from 'react-icons/io'

type Props = FlexProps & {
  label: React.ReactNode
}

const HelpBubble = ({ label, ...props }: Props) => {
  const fillColor = useColorModeValue('brandGray.400', 'brandGray.500')
  const hoverColor = useColorModeValue('brandGray.500', 'gray.300')
  const { isOpen, onOpen, onToggle, onClose } = useDisclosure()
  return (
    <Flex alignItems='center' {...props}>
      <Tooltip
        label={label}
        openDelay={0}
        isOpen={isOpen}
        bg='brandGray.900'
        color={fillColor}
        fontSize='sm'
        lineHeight='1.1rem'
        py={1}
      >
        <Box>
          <Box
            as={IoMdInformationCircle}
            color={fillColor}
            _hover={{ color: hoverColor }}
            cursor='help'
            width='16px'
            height='16px'
            onClick={onToggle}
            onMouseEnter={onOpen}
            onMouseLeave={onClose}
          />
        </Box>
      </Tooltip>
    </Flex>
  )
}

export default HelpBubble
