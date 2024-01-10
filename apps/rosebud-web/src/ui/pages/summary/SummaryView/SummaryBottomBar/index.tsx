import { BoxProps, Button, ButtonProps, Flex, useTheme } from '@chakra-ui/react'

const SummaryBottomBar = ({
  onClick,
  children,
  containerProps = {},
  ...props
}: ButtonProps & {
  containerProps?: BoxProps
}) => {
  const { zIndices } = useTheme()

  return (
    <Flex
      py={4}
      px={8}
      position={{ base: 'fixed', md: 'absolute' }}
      bottom={0}
      w='100%'
      bg='bg'
      zIndex={zIndices.modal}
      borderTop='1px solid'
      borderColor='inherit'
      boxShadow='0px 0px 16px rgba(0, 0, 0, 0.1)'
      justify='center'
      {...containerProps}
    >
      <Button
        variant='primary'
        w={{ base: 'full', md: 'auto' }}
        h='44px'
        onClick={onClick}
        minW='200px'
        {...props}
      >
        {children}
      </Button>
    </Flex>
  )
}

export default SummaryBottomBar
