import { Box, keyframes } from '@chakra-ui/react'

const jiggle = keyframes`
  0% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.1) rotate(-3deg); }
  75% { transform: scale(1.1) rotate(3deg); }
  100% { transform: scale(1) rotate(0deg); }
`

const JiggleBox = ({
  children,
  infinite = false,
}: {
  infinite?: boolean
  children: React.ReactNode
}) => (
  <Box
    _hover={{
      animation: `${jiggle} 0.5s ease-in-out ${
        infinite ? 'infinite alternate' : ''
      }`,
    }}
    _groupHover={{
      animation: `${jiggle} 0.5s ease-in-out ${
        infinite ? 'infinite alternate' : ''
      }`,
    }}
  >
    {children}
  </Box>
)

export default JiggleBox
