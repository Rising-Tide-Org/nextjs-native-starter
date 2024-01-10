import { useState } from 'react'
import AlertDialog from 'ui/core/AlertDialog'
import NavigationBarButton from 'ui/global/Navigation/NavigationBar/NavigationBarButton'
import { RbPencil, RbTrash } from 'ui/shared/Icon'

type Props = {
  onContinueDraft: () => void
  onDeleteDraft: () => void
}

const JournalDetailActionsDraft = ({
  onContinueDraft,
  onDeleteDraft,
}: Props) => {
  const [showDeleteDialogForDraft, setShowDeleteDialogForDraft] =
    useState(false)
  const confirmDeleteForDraft = () => {
    setShowDeleteDialogForDraft(false)
    onDeleteDraft()
  }

  return (
    <>
      <NavigationBarButton
        icon={<RbPencil boxSize='20px' />}
        aria-label='Continue editing draft'
        onClick={onContinueDraft}
      />
      <NavigationBarButton
        icon={<RbTrash boxSize='20px' />}
        aria-label='Delete draft'
        onClick={onDeleteDraft}
      />

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

export default JournalDetailActionsDraft
