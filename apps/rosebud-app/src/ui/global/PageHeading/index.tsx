import { Heading, Flex, FlexProps } from '@chakra-ui/react'
import { kViewPadding } from 'shared/ui/constants'

const PageHeading = ({ children, ...rest }: FlexProps) => {
  return (
    <Flex
      display={{ base: 'none', md: 'flex' }}
      mt={kViewPadding}
      mx={kViewPadding}
      align='center'
      {...rest}
    >
      <Heading as='h1' fontSize='20px' fontWeight={600}>
        {children}
      </Heading>
    </Flex>
  )
}

export default PageHeading
