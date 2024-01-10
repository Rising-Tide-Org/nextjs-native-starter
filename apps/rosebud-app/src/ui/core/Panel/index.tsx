import { Box, BoxProps, useStyleConfig } from '@chakra-ui/react'
import React from 'react'

type Props = BoxProps & {
  variant?: string
}

const Panel = React.forwardRef<HTMLDivElement, any>(
  ({ children, variant, ...props }: Props, ref) => {
    const styles = useStyleConfig('Panel', { variant })
    return (
      <Box ref={ref} __css={styles} {...props}>
        {children}
      </Box>
    )
  }
)

export default Panel
