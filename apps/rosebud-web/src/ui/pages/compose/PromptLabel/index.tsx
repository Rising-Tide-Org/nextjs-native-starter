import { useColorModeValue } from '@chakra-ui/react'
import { ComponentProps } from 'react'
import theme from 'styles/theme'
import MotionBox from 'ui/core/MotionBox'

const PromptLabel = ({
  children,
  isLoading,
  ...props
}: ComponentProps<typeof MotionBox> & { isLoading?: boolean }) => {
  const boxColor = useColorModeValue('blue.600', 'blue.300')
  // const listItem = (children as string).match(/^(\d+)\./)

  return (
    <MotionBox
      layout
      w='full'
      fontSize='17px'
      lineHeight='1.33'
      color={boxColor}
      rounded='md'
      position='relative'
      display='flex'
      justifyContent='space-between'
      gap={2}
      {...props}
    >
      {isLoading ? (
        <svg width='10' height='20' xmlns='http://www.w3.org/2000/svg'>
          <rect width='2' height='18' fill={theme.colors.brandGray[500]}>
            <animate
              attributeName='opacity'
              values='1;0;1'
              dur='1s'
              repeatCount='indefinite'
            />
          </rect>
        </svg>
      ) : (
        <>
          {children}
          {/* {listItem && (
            <RbBookmark
              boxSize='16px'
              position='relative'
              color='blue.200'
              top={1}
              onClick={() => Analytics.trackEvent('compose.prompt.bookmark')}
            />
          )} */}
        </>
      )}
    </MotionBox>
  )
}

export default PromptLabel
