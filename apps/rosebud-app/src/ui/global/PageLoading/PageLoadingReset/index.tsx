import { Button, Flex, Spinner } from '@chakra-ui/react'
import { captureException as sentryCaptureException } from '@sentry/nextjs'
import Analytics from 'lib/analytics'
import routes from 'lib/routes'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

type Props = {
  showReset: boolean
  source: string
  reason?: string
  signOut: () => Promise<void>
}

const PageLoadingReset = ({ showReset, source, reason, signOut }: Props) => {
  const router = useRouter()

  useEffect(() => {
    if (!showReset) return
    Analytics.trackEvent('auth.timeout', { source, reason })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showReset])

  const handleReset = async () => {
    Analytics.trackEvent('auth.reset', { source, reason })
    sentryCaptureException({ message: 'User had to reset auth' })

    try {
      // does this break signOut() ?
      const dbs = await window.indexedDB.databases()
      dbs.forEach((db) => {
        if (db.name) window.indexedDB.deleteDatabase(db.name)
      })
    } catch (e) {
      console.error('enumerating or clearing indexedDb not supported: ', e)
      Analytics.trackEvent('auth.reset.clearIndexedDb.error')
    }

    try {
      window.localStorage.clear()
    } catch (e) {
      console.error('should not happen but localStorage.clear() failed', e)
      Analytics.trackEvent('auth.reset.clearLocalStorage.error')
    }

    // unlikely to fail but
    try {
      await signOut()
    } catch (e) {
      Analytics.trackEvent('auth.reset.signOut.error')
    }

    // extra precaution
    router.push(routes.signin)
  }

  return (
    <Flex
      direction='column'
      justify='center'
      h='100vh'
      w='fit-content'
      align='center'
      gap={8}
    >
      <Spinner />
      <Button
        size='sm'
        bg='brandGray.300'
        _hover={{ bg: 'brandGray.400' }}
        onClick={() => handleReset()}
        visibility={showReset ? 'visible' : 'hidden'}
      >
        Reset
      </Button>
    </Flex>
  )
}

export default PageLoadingReset
