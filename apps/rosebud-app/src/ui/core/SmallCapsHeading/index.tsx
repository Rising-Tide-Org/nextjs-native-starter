import { Text, TextProps } from '@chakra-ui/react'

const SmallCapsHeading = ({ children, ...props }: TextProps) => (
  <Text
    fontWeight={500}
    textTransform='uppercase'
    fontSize='12px'
    fontFamily='Outfit'
    variant={'tertiary'}
    mb={3}
    {...props}
  >
    {children}
  </Text>
)

export default SmallCapsHeading
