import { BoxProps, Flex, Text, Box, useColorModeValue } from '@chakra-ui/react'
import { AiOutlineBulb } from 'react-icons/ai'
import theme from 'styles/theme'

const OnboardingTip = ({ children }: BoxProps) => {
  const desktopBgColor = useColorModeValue('brandGray.100', 'none')
  const borderMode = useColorModeValue('none', '1px solid')

  return (
    <Flex zIndex={2} h='fit-content' align='center' justify='center'>
      <Box pl={2} pb={2} pt={4} mr={2}>
        <Flex
          p={{ base: 2, md: 4 }}
          gap={2}
          align='top'
          border={borderMode}
          borderColor='inherit'
          bg={{
            base: 'none',
            md: desktopBgColor,
          }}
          rounded='md'
        >
          <Box flex={1} pt={1}>
            <AiOutlineBulb size='18px' fill={theme.colors.gold[800]} />
          </Box>
          <Text fontSize='15px' variant='tertiary'>
            {children}
          </Text>
        </Flex>
      </Box>
    </Flex>
  )
}

export default OnboardingTip
