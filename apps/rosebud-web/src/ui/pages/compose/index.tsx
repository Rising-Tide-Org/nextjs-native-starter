import { ComposeProvider } from 'providers/ComposeProvider'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ComposeTemplate, ComposeResponse } from 'types/Compose'
import ComposeView from './ComposeView'
import { ComposeCoordinator } from './ComposeCoordinator'
import { Template } from 'lib/template'
import { useRouter } from 'next/router'
import navigator from 'lib/routes'
import { Entry } from 'types/Entry'
import { fetchOne } from 'db/fetch'
import Analytics from 'lib/analytics'
import { captureException } from '@sentry/nextjs'
import { useStreakProvider } from 'providers/StreakProvider'
import { Timestamp } from 'firebase/firestore'
import moment from 'moment'
import { updateEntryStats } from 'util/stats'

type Props = {
  templateId?: string
  draft?: Entry
  before?: number
  after?: number
  returnTo?: string
  onChange?: (responses: ComposeResponse[], template: ComposeTemplate) => void
  onSkip?: (responses: ComposeResponse[], template: ComposeTemplate) => void
  onSave?: (responses: ComposeResponse[], template: ComposeTemplate) => void
}

const Compose = ({
  templateId,
  draft,
  before,
  after,
  returnTo,
  onChange,
  onSkip,
  onSave,
}: Props) => {
  const { updateStreak } = useStreakProvider()
  const router = useRouter()

  const [template, setTemplate] = useState<ComposeTemplate>()
  const viewTrackedRef = useRef(false)

  /**
   * Fetch the appropriate template based on the id
   */
  useEffect(() => {
    const run = async () => {
      try {
        const template = await Template.fetch(templateId)
        if (
          template &&
          !template.id.includes('onboarding') &&
          !viewTrackedRef.current
        ) {
          viewTrackedRef.current = true
          Analytics.trackEvent('compose.view', {
            template: template.id,
            source: returnTo,
            metadata: template.metadata,
            day: router.query.day as string,
          })
        }
        setTemplate(template)
      } catch (error) {
        console.error(error)
        router.push(navigator.default)
      }
    }

    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, router])

  /**
   * Operations to perform after a successful save
   */
  const postSaveOperations = useCallback(
    async (entryId: string | undefined, responses: ComposeResponse[]) => {
      try {
        if (entryId) {
          const entry = await fetchOne<Entry>('entries', entryId)
          if (!template || !entry) {
            return
          }

          // Increment the streak
          if (entry.day && entry.date && entry.id) {
            await updateStreak('daily', {
              day: entry.day,
              date: new Timestamp(moment.utc(entry.date).unix(), 0),
              itemId: entry.id,
            })
          }

          // Update stats
          await updateEntryStats(entry)

          // Navigate to the summary page, where analysis will occur
          router.push(navigator.composeSummary(entryId, returnTo), undefined, {
            shallow: true,
          })
        }

        if (template) {
          onSave?.(responses, template)
        }
      } catch (error) {
        captureException(error)
        console.error(error)
        Analytics.trackEvent('compose.postSave.error', {
          template: template?.id,
          error: error.message,
        })
        // TODO: Add user facing error
      }
    },
    [onSave, returnTo, router, template, updateStreak]
  )

  if (!template) {
    return null
  }

  return (
    <ComposeProvider
      template={template}
      draft={draft}
      memoryRange={{
        after,
        before,
      }}
      returnTo={returnTo}
      onSave={postSaveOperations}
      onSkip={(responses) => onSkip?.(responses, template)}
      onChange={(responses) => onChange?.(responses, template)}
    >
      <ComposeCoordinator>
        <ComposeView templateId={templateId} />
      </ComposeCoordinator>
    </ComposeProvider>
  )
}

export default Compose
