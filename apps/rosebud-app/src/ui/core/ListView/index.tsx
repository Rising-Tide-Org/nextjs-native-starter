import { StackProps, VStack } from '@chakra-ui/react'

export const ListView = ({ children, ...props }: StackProps) => {
  return (
    <VStack
      rounded='md'
      spacing={0}
      bg='bg'
      overflow='hidden'
      w='full'
      {...props}
    >
      {children}
    </VStack>
  )
}
