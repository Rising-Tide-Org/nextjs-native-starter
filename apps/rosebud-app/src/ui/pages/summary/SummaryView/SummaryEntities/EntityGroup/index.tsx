import { Flex } from '@chakra-ui/react'
import MotionBox from 'shared/ui/core/MotionBox'
import SmallCapsHeading from 'ui/core/SmallCapsHeading'

type Props = {
  title: string
  children: React.ReactNode
  index: number
  animate: boolean
}

const EntityGroup = ({ title, children, index, animate }: Props) => {
  return (
    <MotionBox
      initial={animate ? { x: -50 } : false}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, delay: 0.05 * index }}
    >
      <SmallCapsHeading>{title}</SmallCapsHeading>
      <Flex wrap='wrap' gap={2}>
        {children}
      </Flex>
    </MotionBox>
  )
}

export default EntityGroup
