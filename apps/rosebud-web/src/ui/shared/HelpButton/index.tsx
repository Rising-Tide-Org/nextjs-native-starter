import { Box, Link, Text, useColorModeValue } from '@chakra-ui/react'
import Analytics from 'lib/analytics'
import { IoHelpBuoyOutline } from 'react-icons/io5'

const HelpBubble = () => {
  const color = useColorModeValue('brandGray.700', 'brandGray.300')
  const hoverColor = useColorModeValue('brandGray.800', 'brandGray.200')

  return (
    <Link
      href='https://help.rosebud.app'
      isExternal
      onClick={() => Analytics.trackEvent('menu.help')}
      display='flex'
      alignItems='center'
      gap={1}
      pr={4}
      color={color}
      _hover={{
        color: hoverColor,
      }}
    >
      <Box as={IoHelpBuoyOutline} size='20px' color='inherit' />
      <Text display={{ base: 'none', md: 'block' }}>Help</Text>
    </Link>
  )
}

export default HelpBubble
