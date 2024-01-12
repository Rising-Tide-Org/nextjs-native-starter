import { Button, Flex, Link, useDisclosure } from '@chakra-ui/react'
import { useModalProvider } from 'providers/ModalProvider'
import { HiOutlineChatBubbleOvalLeftEllipsis } from 'react-icons/hi2'
import { IoGift } from 'react-icons/io5'
import { kViewPadding } from 'shared/ui/constants'
import { DiscordIcon } from 'ui/shared/Icon'
import FeedbackModal from 'ui/shared/modals/FeedbackModal'

const buttonProps = {
  variant: 'unstyled',
  border: '1px solid',
  alignItems: 'center',
  display: 'flex',
  borderColor: {
    base: 'brandGray.300',
    md: 'transparent',
  },
  _hover: { base: {}, md: { border: '1px solid', borderColor: 'transparent' } },
  w: { base: 'full', md: 'auto' },
  size: { base: 'md', md: 'sm' },
}

const ReferralCTA = () => {
  const openModal = useModalProvider()
  const {
    isOpen: isFeedbackOpen,
    onOpen: onFeedbackOpen,
    onClose: onFeedbackClose,
  } = useDisclosure()

  return (
    <Flex
      align='start'
      w='100%'
      py={{ base: 4, md: 2 }}
      direction={{ base: 'column', md: 'row' }}
      gap={2}
      px={kViewPadding}
      justify='space-around'
    >
      <Button
        {...buttonProps}
        onClick={() => openModal('referral')}
        leftIcon={<IoGift size='18px' />}
      >
        Gift Rosebud
      </Button>
      <Link
        href='https://discord.gg/dmBTsaTF2J'
        isExternal
        _hover={{ textDecoration: 'none' }}
        w={{ base: 'full', md: 'auto' }}
      >
        <Button {...buttonProps} leftIcon={<DiscordIcon boxSize='20px' />}>
          Join our Discord
        </Button>
      </Link>
      <Button
        {...buttonProps}
        onClick={onFeedbackOpen}
        leftIcon={<HiOutlineChatBubbleOvalLeftEllipsis size='18px' />}
      >
        Send feedback
      </Button>

      <FeedbackModal isOpen={isFeedbackOpen} onClose={onFeedbackClose} />
    </Flex>
  )
}

export default ReferralCTA
