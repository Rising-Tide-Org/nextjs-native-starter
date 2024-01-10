import { Button, ChakraProps } from '@chakra-ui/react'

type Props = {
  label: string
  isSelected: boolean
  isDisabled?: boolean
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
} & ChakraProps

const SelectableOption = ({ label, isSelected, ...props }: Props) => {
  return (
    <Button
      border='1px solid'
      size='sm'
      whiteSpace={'normal'}
      h='auto'
      minH={8}
      py={2}
      textAlign='left'
      borderColor={isSelected ? 'yellow.400' : 'brandGray.300'}
      bg={isSelected ? 'yellow.200' : 'white'}
      _hover={{
        bg: isSelected ? 'yellow.200' : 'yellow.100',
        borderColor: 'yellow.400',
      }}
      _focus={{
        bg: isSelected ? 'yellow.200' : 'white',
        borderColor: 'yellow.400',
      }}
      data-sentry-block
      {...props}
    >
      {label}
    </Button>
  )
}

export default SelectableOption
