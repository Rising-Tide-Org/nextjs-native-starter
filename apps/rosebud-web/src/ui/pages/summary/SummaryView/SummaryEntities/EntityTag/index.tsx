import { Box, BoxProps, Tag, useColorModeValue } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useCallback } from 'react'
import { FiX } from 'react-icons/fi'
import MotionBox from 'ui/core/MotionBox'

type Props = BoxProps & {
  itemId: string
  children: React.ReactNode
  onRemove?: () => void
  index?: number
  animate?: boolean
  editable?: boolean
  navigable?: boolean
}

const EntityTag = ({
  children,
  itemId,
  index = 0,
  animate = false,
  onRemove,
  editable = false,
  navigable = false,
  ...props
}: Props) => {
  const router = useRouter()
  const handleClick = useCallback(
    (entity?: string) =>
      router.push(`/review/${entity}?returnTo=${router.asPath}`, undefined, {
        shallow: true,
      }),
    [router]
  )

  const bgColor = useColorModeValue('gray.100', 'gray.800')
  const hoverBgColor = useColorModeValue('gray.200', 'gray.700')
  const borderColor = useColorModeValue('brandGray.100', 'brandGray.750')
  const xColorHover = useColorModeValue('brandGray.800', 'brandGray.400')

  return (
    <MotionBox
      as={Tag}
      bg={bgColor}
      border='1px solid'
      borderColor={borderColor}
      px={2}
      py={1}
      rounded='md'
      display='flex'
      gap={1}
      initial={animate ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.05 * index }}
      alignItems='center'
      cursor={navigable ? 'pointer' : undefined}
      _hover={navigable && { bg: hoverBgColor }}
      onClick={() => navigable && handleClick(itemId)}
      {...props}
    >
      {children}

      {editable && (
        <Box
          as={FiX}
          color='textSecondary'
          cursor='pointer'
          _hover={{
            color: xColorHover,
          }}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
            e.preventDefault()
            onRemove?.()
          }}
        />
      )}
    </MotionBox>
  )
}

export default EntityTag
