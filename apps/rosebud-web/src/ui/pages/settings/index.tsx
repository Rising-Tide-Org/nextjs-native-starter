import { Flex, Icon, Badge, Box, Text, Link } from '@chakra-ui/react'
import Analytics from 'lib/analytics'
import { useAuthProvider } from 'providers/AuthProvider'
import { useUserProvider } from 'providers/UserProvider'
import { useEffect, useMemo } from 'react'
import { CgProfile } from 'react-icons/cg'
import { RbManifest, RbCloudSync, RbExport, RbMemory } from 'ui/shared/Icon'
import CloudSyncSettings from 'ui/pages/settings/CloudSyncSettings'
import ImportExportSettings from './ImportExportSettings'
import MemorySettings from './MemorySettings'
import ReminderSettings from './ReminderSettings'
import ComposeSettings from './ComposeSettings'
import Section, { SectionBody } from 'ui/pages/settings/Section'
import { isProd } from 'util/env'
import { isStaffUser } from 'util/user'
import PageLoading from 'ui/global/PageLoading'
import AccountSettings from './AccountSettings'
import { MdOutlineLanguage } from 'react-icons/md'
import LanguageSetting from './LanguageSettings'
import PageHeading from 'ui/global/PageHeading'
import { kViewPadding } from 'shared/ui/constants'
import NavigationBar from 'ui/global/Navigation/NavigationBar'
import { useSubscriptionProvider } from 'providers/SubscriptionProvider'
import ModelSettings from './ModelSettings'
import ThemeSetting from './ThemeSetting'
import { FaRegMoon } from 'react-icons/fa'
import ExportToMarkdown from './ExportToMarkdown'

type Props = {
  returnTo?: string
}

const Settings = ({ returnTo }: Props) => {
  const { user: authUser, signOut } = useAuthProvider()
  const { user } = useUserProvider()
  const { hasMemoryFeature } = useSubscriptionProvider()

  useEffect(() => {
    Analytics.trackEvent('settings.view', {
      source: returnTo,
    })
  }, [returnTo])

  const isStaff = useMemo(() => isStaffUser(user.uuid), [user.uuid])

  // When signin out, temporarily we do not have the user object, so need to show the loading screen
  if (!authUser) {
    return <PageLoading />
  }

  return (
    <>
      <NavigationBar title='Settings' />
      <PageHeading>Settings</PageHeading>
      <Box px={kViewPadding}>
        <Flex direction='column' gap={4} mt={kViewPadding} mb={6}>
          <Flex rounded='md' direction='column' gap={2}>
            <Section
              title='Account'
              icon={<Icon as={CgProfile} boxSize='20px' />}
              rightElement={
                !authUser?.isAnonymous && !authUser.emailVerified ? (
                  <Badge colorScheme='red'>Unverified</Badge>
                ) : null
              }
            >
              <SectionBody display='flex' flexDirection='column' gap={6}>
                <AccountSettings />
              </SectionBody>
            </Section>

            {/* Journaling mode */}

            <Section
              title='Journaling mode'
              icon={<RbManifest boxSize='20px' />}
            >
              <Box w='full'>
                <ComposeSettings
                  journalMode={user?.settings?.journalMode || 'focused'}
                />
              </Box>
            </Section>

            {/* Reminders */}

            <ReminderSettings />

            {/* Cloud sync */}

            <Section
              title='Cloud Sync'
              icon={<RbCloudSync boxSize='20px' />}
              rightElement={
                authUser?.isAnonymous ? (
                  <Badge colorScheme='red'>Disabled</Badge>
                ) : (
                  <Badge colorScheme='green'>Enabled</Badge>
                )
              }
            >
              <SectionBody>
                <CloudSyncSettings />
              </SectionBody>
            </Section>

            <Section
              title='AI Language'
              icon={<MdOutlineLanguage size='20px' />}
            >
              <SectionBody>
                <LanguageSetting />
              </SectionBody>
            </Section>

            <Section title='Theme' icon={<FaRegMoon size='20px' />}>
              <SectionBody>
                <ThemeSetting />
              </SectionBody>
            </Section>

            {/* Advanced AI */}

            {hasMemoryFeature ? <ModelSettings /> : null}

            {/* Memory */}

            <Section
              title='Memory'
              icon={<RbMemory boxSize='20px' />}
              rightElement={<Badge colorScheme='gold'>Bloom</Badge>}
            >
              <SectionBody>
                <MemorySettings />
              </SectionBody>
            </Section>

            {/* Export to markdown */}

            <Section
              title='Export to markdown'
              icon={<RbExport boxSize='20px' />}
            >
              <SectionBody>
                <ExportToMarkdown />
              </SectionBody>
            </Section>

            {/* Import export */}

            {(isStaff || !isProd()) && (
              <Section
                title='Data'
                icon={<RbExport boxSize='20px' />}
                rightElement={<Badge colorScheme='gray'>Staff-only</Badge>}
              >
                <SectionBody>
                  <ImportExportSettings />
                </SectionBody>
              </Section>
            )}

            <Flex justify='space-between' px={2} pt={4}>
              <Text fontSize='md' color='gray.500'>
                v{process.env.APP_VERSION || 0}
              </Text>
              <Link fontSize='md' color='gray.500' onClick={() => signOut()}>
                Sign out
              </Link>
            </Flex>
          </Flex>
        </Flex>
      </Box>
    </>
  )
}

export default Settings
