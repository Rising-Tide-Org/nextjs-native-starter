import { Box, useColorMode, useColorModeValue } from '@chakra-ui/react'
import { forwardRef } from 'react'
import scrollBarCss from 'styles/theme/components/scrollbar'

type Props = {
  children: React.ReactNode
  mobileHeight?: string
  templateId?: string
  borderless?: boolean
}

const ComposeContainer = forwardRef<HTMLDivElement, any>(
  (
    { children, mobileHeight, templateId, borderless, ...props }: Props,
    ref
  ) => {
    const { colorMode } = useColorMode()
    const composeViewBorderColor = useColorModeValue('brandGray.300', 'inherit')

    return (
      <Box
        h={{ base: mobileHeight ?? '100vh', md: '90vh' }}
        maxH='1024px'
        top={{ base: 0, md: '50%' }}
        left={{ base: 0, md: '50%' }}
        transform={{ base: 'none', md: 'translate(-50%, -50%)' }}
        position={{ base: 'relative', md: 'absolute' }}
        w={{ base: 'full', md: '640px' }}
        data-testid={templateId}
      >
        <Box
          h='full'
          border={{ base: 'none', md: borderless ? 'none' : '1px solid' }}
          borderColor={{ md: composeViewBorderColor }}
          boxShadow={{ base: 'none', md: '0px 0px 16px rgba(0, 0, 0, 0.05)' }}
          rounded={{ md: 'lg' }}
          overflow='hidden'
          position='relative'
        >
          <Box
            h='100%'
            overflowY='auto'
            css={scrollBarCss(colorMode)}
            bg='bg'
            ref={ref}
            {...props}
          >
            {children}
          </Box>
        </Box>
      </Box>
    )
  }
)

export default ComposeContainer
