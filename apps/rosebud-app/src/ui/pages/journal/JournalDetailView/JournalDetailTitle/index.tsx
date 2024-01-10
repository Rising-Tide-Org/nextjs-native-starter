import { Editable, EditablePreview, EditableTextarea } from '@chakra-ui/react'
import { FocusEventHandler, useEffect, useState } from 'react'
import ResizeTextarea from 'react-textarea-autosize'

type Props = {
  title: string
  isDisabled?: boolean
  onSave: (value?: string) => void
}

const JournalDetailTitle = ({ title, onSave, isDisabled }: Props) => {
  const [editableTitle, setEditableTitle] = useState(title)

  useEffect(() => {
    setEditableTitle(title)
  }, [title])

  const handleSubmit = (value?: string) => {
    onSave(value)
  }

  const handleFocus: FocusEventHandler<HTMLTextAreaElement> = (e) => {
    const textarea = e.target as HTMLTextAreaElement
    if (textarea) {
      textarea.focus()
      textarea.selectionStart = textarea.value.length
      textarea.selectionEnd = textarea.value.length
    }
  }

  return (
    <Editable
      onSubmit={handleSubmit}
      value={editableTitle}
      onChange={(nextValue) => setEditableTitle(nextValue)}
      fontSize='22px'
      fontWeight={600}
      data-sentry-block
      flex={1}
      isDisabled={isDisabled}
      selectAllOnFocus={false}
    >
      <EditablePreview w='full' />
      <EditableTextarea
        as={ResizeTextarea}
        minRows={1}
        pb={0}
        mb='-4.5px'
        onFocus={handleFocus}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !e.metaKey) {
            e.preventDefault()
            const textarea = e.target as HTMLTextAreaElement
            textarea.blur()
          }
        }}
      />
    </Editable>
  )
}

export default JournalDetailTitle
