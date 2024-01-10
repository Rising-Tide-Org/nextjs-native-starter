import { Box, Flex } from '@chakra-ui/react'
import { useComposeProvider } from 'providers/ComposeProvider'
import ComposeTopBar from 'ui/pages/compose/ComposeTopBar'
import ComposeResponseInput from '../ComposeResponseInput'
import { useComposeCoordinator } from '../ComposeCoordinator'
import ComposeLoader from '../ComposeLoader'
import ComposeResponses from '../ComposeResponses'
import ComposeSpacer from '../ComposeSpacer'
import { useEffect } from 'react'
import Analytics from 'lib/analytics'
import JournalModeToggle from '../ComposeResponseInput/JournalModeToggle'
import ComposeContainer from '../ComposeContainer'

type Props = {
  templateId?: string
}

const ComposeView = ({ templateId }: Props) => {
  const { isSaving, isLoading, exitEntry } = useComposeProvider()
  const { containerRef } = useComposeCoordinator()

  useEffect(() => {
    // This tracks time to the eventual journal.save.success
    Analytics.timeEvent('journal.save.success')
  }, [])

  return (
    <ComposeContainer ref={containerRef} templateId={templateId}>
      <ComposeTopBar onBack={() => exitEntry()} />
      <Box
        p={{ base: 4, md: 6 }}
        opacity={isSaving ? 0.5 : 1}
        css={{ pointerEvents: isSaving ? 'none' : 'auto' }}
      >
        <Flex direction='column' gap={6}>
          <ComposeResponses />
          <ComposeLoader />
          <ComposeResponseInput />
        </Flex>

        {!isLoading && <Box h='8px' />}
      </Box>

      <ComposeSpacer />

      <JournalModeToggle />
    </ComposeContainer>
  )
}
export default ComposeView
