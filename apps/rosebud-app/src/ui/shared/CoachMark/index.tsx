import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  Flex,
  Text,
  PopoverCloseButton,
  PlacementWithLogical,
  Box,
  useTheme,
  useColorModeValue,
} from '@chakra-ui/react'
import { coachMarks } from 'constants/onboarding'
import { useUserProvider } from 'providers/UserProvider'
import { useCallback, useEffect, useState } from 'react'
import { AiOutlineBulb } from 'react-icons/ai'
import theme from 'styles/theme'
import { UserFlag } from 'types/User'

type Props = {
  flag: UserFlag
  prerequisites?: UserFlag[]
  children: React.ReactNode
  offset?: [number, number]
  delay?: number
  isDisabled?: boolean
  placement?: PlacementWithLogical
}

const CoachMark = ({
  flag,
  prerequisites = [],
  children,
  offset = [0, 16],
  delay = 250,
  isDisabled,
  placement,
}: Props) => {
  const { user, setUserFlag } = useUserProvider()
  const { zIndices } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const bgColor = useColorModeValue('gold.50', '#494337')
  const borderColor = useColorModeValue('gold.300', 'gold.900')
  const textColor = useColorModeValue('brandGray.800', 'brandGray.200')

  const handleClose = useCallback(async () => {
    if (isDisabled) return
    await setUserFlag(flag, true)
  }, [flag, isDisabled, setUserFlag])

  useEffect(() => {
    // If the user hasn't completed the prerequisites, don't show the coach mark
    if (prerequisites.some((prerequisite) => !user?.flags?.[prerequisite])) {
      return
    }
    if (isDisabled) return
    const timeout = window.setTimeout(() => {
      setIsOpen(true)
    }, delay)
    return () => window.clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.flags, isDisabled])

  if (user?.flags?.[flag] || isDisabled) {
    return <>{children}</>
  }

  return (
    <Popover
      isOpen={isOpen}
      offset={offset}
      onClose={handleClose}
      autoFocus={false}
      placement={placement}
    >
      <PopoverTrigger>{children}</PopoverTrigger>

      <PopoverContent
        bg={bgColor}
        borderColor={borderColor}
        mx={4}
        onClick={handleClose}
        zIndex={zIndices.sticky}
      >
        <PopoverArrow
          bg={bgColor}
          borderTop='1px solid'
          borderLeft='1px solid'
          borderColor={borderColor}
        />
        <PopoverCloseButton
          color='brandGray.500'
          top={2}
          data-testid='tooltip-Close-Btn'
        />
        <Flex align='top' px={3} py={2} gap={2}>
          <Box mt='2px'>
            <AiOutlineBulb size='18px' fill={theme.colors.gold[800]} />
          </Box>
          <Flex direction='column' gap={1} pr={6} flex={1}>
            <Text fontSize='15px' color={textColor}>
              {coachMarks[flag]}
            </Text>
          </Flex>
        </Flex>
      </PopoverContent>
    </Popover>
  )
}

export default CoachMark
