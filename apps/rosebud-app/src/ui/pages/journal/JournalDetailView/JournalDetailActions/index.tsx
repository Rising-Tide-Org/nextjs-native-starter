import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Box,
} from '@chakra-ui/react'
import { useState } from 'react'
import AlertDialog from 'ui/core/AlertDialog'
import NavigationBarButton from 'ui/global/Navigation/NavigationBar/NavigationBarButton'
import { RbEllipseVertical, RbShare } from 'ui/shared/Icon'

type Props = {
  onShare: (type: string) => void
  onExport: () => void
  onGenerateSummary: () => void
  onDeleteEntry: () => void
  onDeleteDraft: () => void
  canGenerateSummary: boolean
  hasSummary: boolean
  isDraft: boolean
}

const JournalDetailActions = ({
  onShare,
  onExport,
  onGenerateSummary,
  onDeleteEntry,
  onDeleteDraft,
  canGenerateSummary,
  hasSummary,
  isDraft,
}: Props) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const confirmDelete = () => {
    setShowDeleteDialog(false)
    onDeleteEntry()
  }
  const [showDeleteDialogForDraft, setShowDeleteDialogForDraft] =
    useState(false)
  const confirmDeleteForDraft = () => {
    setShowDeleteDialogForDraft(false)
    onDeleteDraft()
  }

  const shareButton = (
    <NavigationBarButton
      icon={<RbShare boxSize='20px' />}
      aria-label='Share entry'
      onClick={hasSummary ? () => onShare('analysis') : () => onShare('entry')}
    />
  )

  return (
    <>
      {hasSummary ? (
        <Menu placement='bottom-end'>
          <MenuButton as={Box} display='inline-block' cursor='pointer'>
            {shareButton}
          </MenuButton>
          <MenuList w='fit-content'>
            <MenuItem onClick={() => onShare('entry')}>Share entry</MenuItem>
            {hasSummary && (
              <>
                <MenuItem onClick={() => onShare('analysis')}>
                  Share summary
                </MenuItem>
              </>
            )}
          </MenuList>
        </Menu>
      ) : isDraft ? null : (
        shareButton
      )}

      <Menu placement='bottom-end'>
        <NavigationBarButton
          as={MenuButton}
          icon={<RbEllipseVertical boxSize='16px' />}
          aria-label='More options'
        />

        <MenuList>
          {canGenerateSummary && (
            <>
              <MenuItem onClick={() => onGenerateSummary()}>Summarize</MenuItem>
              <MenuDivider />
            </>
          )}

          <MenuItem onClick={onExport}>Export</MenuItem>

          <MenuItem
            onClick={() =>
              isDraft
                ? setShowDeleteDialogForDraft(true)
                : setShowDeleteDialog(true)
            }
          >
            Delete
          </MenuItem>
        </MenuList>
      </Menu>
      {showDeleteDialog && (
        <AlertDialog
          isOpen={showDeleteDialog}
          title='Delete entry?'
          message='Are you sure you want to delete this entry? This action cannot be undone.'
          confirmText='Delete entry'
          cancelText='Cancel'
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={() => confirmDelete()}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}
      {showDeleteDialogForDraft && (
        <AlertDialog
          isOpen={showDeleteDialogForDraft}
          title='Delete draft?'
          message='Are you sure you want to delete this draft? This action cannot be undone.'
          confirmText='Delete draft'
          cancelText='Cancel'
          onClose={() => setShowDeleteDialogForDraft(false)}
          onConfirm={() => confirmDeleteForDraft()}
          onCancel={() => setShowDeleteDialogForDraft(false)}
        />
      )}
    </>
  )
}

export default JournalDetailActions
