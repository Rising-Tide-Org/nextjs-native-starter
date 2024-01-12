import { Spinner, LinkOverlay, Button } from '@chakra-ui/react'
import { usePromptProvider } from 'providers/PromptProvider'
import { useSubscriptionProvider } from 'providers/SubscriptionProvider'
import { useEffect } from 'react'
import { TbRefresh } from 'react-icons/tb'
import { PromptType } from 'types/Prompt'
import EmptyPageState from 'ui/core/EmptyPageState'
import NextLink from 'next/link'
import routes from 'lib/routes'
import PromptList from '../PromptList'
import Analytics from 'lib/analytics'
import useFetchMany from 'shared/hooks/useFetchMany'
import { limit, query } from 'firebase/firestore'
import { Entry } from 'types/Entry'

type Props = {
  tabKey: PromptType
}

const PersonalizedPrompts = ({ tabKey }: Props) => {
  // Providers
  const { isSubscriptionActive, openSubscribeModal } = useSubscriptionProvider()
  const { prompts, promptsGenerating, promptsError, generatePersonalPrompts } =
    usePromptProvider()

  // Data fetching
  const { data: entries, loading: entriesLoading } = useFetchMany<Entry>(
    'entries',
    (q) => query(q, limit(1))
  )

  // Analytics
  useEffect(
    () => Analytics.trackEvent('prompts.view', { tab: tabKey }),
    [tabKey]
  )

  const handleRegeneratePrompts = async () => {
    if (!isSubscriptionActive) {
      openSubscribeModal('regeneratePrompts')
      return
    }

    await generatePersonalPrompts()
  }

  const filteredPrompts = prompts?.filter((prompt) => {
    if (tabKey === 'bookmarks') {
      return prompt.isBookmarked
    }

    return prompt
  })

  if (promptsError) {
    return (
      <EmptyPageState
        icon='🐛'
        header={'There was an error, please refresh the page'}
        label={promptsError}
      />
    )
  }

  if (promptsGenerating || entriesLoading) {
    return <EmptyPageState afterElement={<Spinner />} />
  }

  if (tabKey === 'bookmarks' && !filteredPrompts?.length) {
    return (
      <EmptyPageState
        icon='📌'
        label='Save your favorite prompts and access them here later'
        afterElement={
          !isSubscriptionActive ? (
            <Button
              variant='brand'
              size='md'
              onClick={() => openSubscribeModal('bookmarks')}
              data-testid='regenerate-prompts-btn'
            >
              Upgrade to Premium
            </Button>
          ) : null
        }
      />
    )
  }

  if (tabKey === 'personal' && entries?.length === 0) {
    return (
      <EmptyPageState
        icon='✨'
        label={
          "The more entries you write, the more personalized prompts you'll get."
        }
        header={'Unlock personalized prompts'}
        afterElement={
          <Button variant='primary' size='md'>
            <LinkOverlay
              as={NextLink}
              href={routes.composeTemplate('rose-bud-thorn')}
              passHref
              shallow
              data-testid='write-first-entry'
            >
              Write first entry &rarr;
            </LinkOverlay>
          </Button>
        }
      />
    )
  }

  if (!filteredPrompts?.length) {
    return (
      <EmptyPageState
        icon='🧘‍♀️'
        label='Prompts will refresh after your next daily check-in'
        afterElement={
          <Button
            variant='primary'
            size='md'
            leftIcon={<TbRefresh size='20px' />}
            onClick={handleRegeneratePrompts}
            data-testid='regenerate-prompts-btn'
          >
            Regenerate prompts
          </Button>
        }
      />
    )
  }

  return <PromptList prompts={filteredPrompts} />
}

export default PersonalizedPrompts
