import { Flex, Progress, useTheme } from '@chakra-ui/react'
import { useComposeProvider } from 'providers/ComposeProvider'
import { useMemo } from 'react'
import TopBar from 'ui/global/TopBar'
import { useComposeCoordinator } from 'ui/pages/compose/ComposeCoordinator'
import ComposeTopBarButton from './ComposeTopBarButton'

type Props = {
  onBack?: () => void
}

const ComposeTopBar = ({ onBack }: Props) => {
  const { composeTemplate, responses, activeResponse } = useComposeProvider()
  const { progressValue } = useComposeCoordinator()
  const { zIndices } = useTheme()

  /**
   * Derive the title of the entry from the template. Can be dynamic.
   */
  const title: string = useMemo(() => {
    if (!composeTemplate) return 'New entry'
    if (composeTemplate && typeof composeTemplate.name === 'function') {
      return composeTemplate.name([...responses].concat(activeResponse ?? []))
    }
    return composeTemplate.name as string
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [composeTemplate, responses, activeResponse?.id])

  return (
    <Flex position='sticky' top={0} zIndex={zIndices.sticky} bg='transparent'>
      <TopBar
        title={title}
        onBack={onBack}
        hideBackButton={
          composeTemplate.id.includes('onboarding') ||
          composeTemplate.hideBackButton
        }
        rightAction={<ComposeTopBarButton />}
        overlayEffect
      />
      {composeTemplate.shouldShowProgress && (
        <Progress
          colorScheme='brand'
          value={progressValue * 100}
          size='xs'
          w='full'
          variant='primary'
          position='absolute'
          bottom='-2px'
          left={0}
          zIndex={zIndices.sticky - 1}
          h='2px'
          sx={{
            '& > div:first-of-type': {
              transitionProperty: 'width',
            },
          }}
        />
      )}
    </Flex>
  )
}

export default ComposeTopBar
