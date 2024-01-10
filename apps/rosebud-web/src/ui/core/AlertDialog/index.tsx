import {
  AlertDialog as ChAlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Divider,
  Button,
  useColorModeValue,
  Box,
} from '@chakra-ui/react'
import React, { forwardRef } from 'react'
import theme from 'styles/theme'
const { zIndices } = theme

export type AlertProps = {
  title: string
  message: string
  confirmText: string
  cancelText?: string
  onClose: () => void
  onConfirm?: () => void
  onCancel?: () => void
  isConfirmLoading?: boolean
  isCancelLoading?: boolean
  noCloseOnCancel?: boolean
  closeOnOverlayClick?: boolean
  confirmButtonVariant?: string
  isOpen: boolean
}

const AlertDialog = forwardRef(
  (
    {
      title,
      message,
      confirmText,
      cancelText,
      onClose,
      onConfirm,
      onCancel,
      isOpen,
      isConfirmLoading,
      isCancelLoading,
      noCloseOnCancel,
      closeOnOverlayClick,
      confirmButtonVariant,
      ...props
    }: AlertProps,
    ref
  ) => {
    const onClickCancel = () => {
      onCancel?.()
      if (!noCloseOnCancel) {
        onClose()
      }
    }

    // Set confirm button variant to default 'primary' only if not explicitly set and the secondary action was specified
    const confirmButtonVariantParsed =
      Boolean(onCancel) && !confirmButtonVariant
        ? 'primary'
        : confirmButtonVariant

    const backgroundColor = useColorModeValue('white', 'gray.900')
    const headerColor = useColorModeValue('gray.200', 'gray.700')
    const textColor = useColorModeValue('gray.1000', 'gray.200')

    return (
      <ChAlertDialog
        {...props}
        isOpen={isOpen}
        onClose={onClose}
        closeOnOverlayClick={closeOnOverlayClick}
        // @ts-expect-error TODO needs a refactor forwardRef vs refObject
        leastDestructiveRef={ref}
        isCentered
        preserveScrollBarGap
      >
        <Box zIndex={zIndices.modal + 10} position='relative'>
          <AlertDialogOverlay />
          <AlertDialogContent
            m='0'
            rounded='md'
            maxWidth={{ base: '90%', md: '400px' }}
            background={backgroundColor}
            overflow='hidden'
            border='1px solid'
            borderColor={headerColor}
          >
            <AlertDialogHeader
              fontSize='md'
              fontWeight={500}
              p={4}
              pb={0}
              color={textColor}
            >
              {title}
            </AlertDialogHeader>
            <Divider borderColor={headerColor} />
            <AlertDialogBody p={4} color={textColor}>
              {message}
            </AlertDialogBody>

            <AlertDialogFooter
              pb={4}
              px={4}
              justifyContent={'flex-end'}
              flexDirection={{ base: 'column-reverse', sm: 'row' }}
              gap={2}
            >
              {onCancel && (
                <Button
                  width={{ base: '100%', sm: 'auto' }}
                  size='md'
                  onClick={onClickCancel}
                  isLoading={isCancelLoading}
                >
                  {cancelText ? cancelText : 'Cancel'}
                </Button>
              )}
              <Button
                width={{ base: '100%', sm: 'auto' }}
                size='md'
                onClick={onConfirm ?? onClose}
                ml={[0, 2]}
                mb={0}
                variant={confirmButtonVariantParsed}
                isLoading={isConfirmLoading}
              >
                {confirmText}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </Box>
      </ChAlertDialog>
    )
  }
)

AlertDialog.displayName = 'AlertDialog'

export default AlertDialog
