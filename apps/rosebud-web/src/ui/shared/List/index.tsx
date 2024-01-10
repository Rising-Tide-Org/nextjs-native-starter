import { Flex, FlexProps } from '@chakra-ui/react'

const List = ({ children, ...props }: FlexProps) => (
  <Flex direction='column' {...props} gap={2}>
    {children}
  </Flex>
)

export default List
