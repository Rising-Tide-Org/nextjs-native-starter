import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  DrawerProps,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  ModalProps,
  useBreakpointValue,
  useTheme,
} from '@chakra-ui/react'

type Props = ModalProps &
  DrawerProps & {
    isOpen: boolean
    onClose: () => void
    onOpen: () => void
    children: React.ReactNode
    closeButtonTestId?: string
  }

const DrawerOrModal = ({ children, closeButtonTestId, ...props }: Props) => {
  const { zIndices } = useTheme()
  const isDrawer = useBreakpointValue({ base: true, lg: false })

  const DrawerOrModal = isDrawer ? Drawer : Modal
  const Overlay = isDrawer ? DrawerOverlay : ModalOverlay
  const Content = isDrawer ? DrawerContent : ModalContent
  const Body = isDrawer ? DrawerBody : ModalBody
  const CloseButton = isDrawer ? DrawerCloseButton : ModalCloseButton

  return (
    <DrawerOrModal placement='bottom' {...props}>
      <Overlay />
      <Content>
        <Body
          p={0}
          roundedTop='md'
          overflow='hidden'
          bg='bg'
          roundedBottom={!isDrawer ? 'md' : undefined}
        >
          <CloseButton
            zIndex={zIndices.sticky}
            data-testid={closeButtonTestId}
          />
          {children}
        </Body>
      </Content>
    </DrawerOrModal>
  )
}

export default DrawerOrModal
