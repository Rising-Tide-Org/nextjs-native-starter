import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  Button,
  Icon,
  Box,
  Portal,
  PopoverHeader,
} from '@chakra-ui/react'
import useIsMobile from 'shared/hooks/useIsMobile'
import { useCallback, useState } from 'react'
import { IoInformationCircle } from 'react-icons/io5'
import SmallCapsHeading from '../SmallCapsHeading'

type Props = {
  children: React.ReactNode
  title: string
}

const PersonalizationTipsPopover = ({ children, title }: Props) => {
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useIsMobile()

  const handleOnOpen = useCallback(() => {
    setIsOpen(true)
  }, [])

  const handleOnClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  return (
    <Popover
      isOpen={isOpen}
      onOpen={handleOnOpen}
      onClose={handleOnClose}
      placement={isMobile ? 'bottom' : 'right-start'}
      closeOnEsc={false}
      closeOnBlur={isMobile}
      offset={[0, isMobile ? 0 : 14]}
    >
      <PopoverTrigger>
        <Button
          variant='ghost'
          size='md'
          pb={0}
          px={0}
          fontWeight={500}
          _hover={{
            background: 'none',
          }}
          alignSelf='center'
          role='group'
          rounded='none'
        >
          <SmallCapsHeading mb={0} mr={1}>
            Tips
          </SmallCapsHeading>
          <Icon as={IoInformationCircle} boxSize={4} color='brandGray.500' />
        </Button>
      </PopoverTrigger>

      <Portal>
        <Box
          sx={{
            '& .chakra-popover__popper': {
              zIndex: 'popover',
            },
          }}
        >
          <PopoverContent
            border={0}
            backgroundColor='brandGray.900'
            maxW='480px'
          >
            <PopoverHeader border={0} px={4} pb={0} pt={3}>
              <SmallCapsHeading mb={0} color='brandGray.400'>
                Writing {title}
              </SmallCapsHeading>
            </PopoverHeader>
            <PopoverArrow backgroundColor='brandGray.900' />
            <PopoverCloseButton color='brandGray.200' top={2} />
            <PopoverBody pt={0}>{children}</PopoverBody>
          </PopoverContent>
        </Box>
      </Portal>
    </Popover>
  )
}

export default PersonalizationTipsPopover
