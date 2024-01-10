import { ButtonProps, Button, Icon } from '@chakra-ui/react'
import { useComposeProvider } from 'providers/ComposeProvider'
import { useMemo } from 'react'
import { useComposeCoordinator } from '../../ComposeCoordinator'
import { useModalProvider } from 'providers/ModalProvider'
import { RbConfig } from 'ui/shared/Icon'

const ComposeTopBarButton = () => {
  const { composeTemplate, skipToEntry, responses, activeResponse } =
    useComposeProvider()
  const { canSkip } = useComposeCoordinator()
  const openModal = useModalProvider()

  // Open the personalization modal
  const handleProfileClick = () => {
    openModal('personalization')
  }

  /**
   * Determine whether to show finish or skip button or none.
   */
  const canFinish = useMemo(() => {
    if (!composeTemplate.entryBeginsAtPromptId) {
      return true
    }

    const promptIndex = [...responses, activeResponse].findIndex(
      (p) => p?.id === composeTemplate.entryBeginsAtPromptId
    )
    if (promptIndex > -1) {
      return true
    }
    return false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [composeTemplate.entryBeginsAtPromptId, responses, activeResponse?.id])

  // Show a skip button if we can't finish
  // TODO: canSkip logic should be updated to not require canFinish here
  if (!canFinish && canSkip) {
    return (
      <TopBarButton
        onClick={skipToEntry}
        color='brandGray.500'
        data-testid='skip-button'
      >
        Skip
      </TopBarButton>
    )
  }

  // Show the personalization button if it's not disabled
  if (!composeTemplate.settings?.disablePersonalization) {
    return (
      <Button size='sm' variant='ghost' onClick={handleProfileClick}>
        <Icon as={RbConfig} boxSize={5} />
      </Button>
    )
  }

  return null
}

export default ComposeTopBarButton

const TopBarButton = ({ children, ...props }: ButtonProps) => (
  <Button
    data-testid='save-entry-button'
    size='md'
    variant='ghost'
    color='brand.500'
    fontWeight='normal'
    mx={-3}
    {...props}
  >
    {children}
  </Button>
)
