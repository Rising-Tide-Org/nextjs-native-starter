import { TextProps } from '@chakra-ui/react'
import SmallCapsHeading from 'ui/core/SmallCapsHeading'

const ListViewHeading = ({ children, ...props }: TextProps) => (
  <SmallCapsHeading
    alignSelf='start'
    textTransform='none'
    px={{ base: 2, md: 4 }}
    fontSize='14px'
    m={0}
    pt={2}
    pb={3}
    {...props}
  >
    {children}
  </SmallCapsHeading>
)

export default ListViewHeading
