import { Flex, FlexProps, useColorModeValue } from '@chakra-ui/react'

type Props = FlexProps & {
  isSelected?: boolean
}

export const ListViewItem = ({ children, isSelected, ...props }: Props) => {
  const bgColorHover = useColorModeValue('brandGray.50', 'gray.900')

  return (
    <Flex
      w='full'
      _notLast={{
        borderBottom: '1px solid',
        borderBottomColor: 'borderList',
      }}
      _hover={{
        base: {},
        md: {
          bg: !isSelected && bgColorHover,
        },
      }}
      bg={isSelected ? { base: 'inherit', md: 'bgSelected' } : 'inherit'}
      px={4}
      py={3}
      align='center'
      cursor='pointer'
      {...props}
    >
      {children}
    </Flex>
  )
}
