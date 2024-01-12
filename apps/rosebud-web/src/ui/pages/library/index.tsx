import { VStack, Box, Tab, TabList, Tabs, Flex } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import PersonalizedPrompts from './PersonalizedPrompts'
import GuidedJournals from './GuidedJournals'
import { kViewPadding } from 'shared/ui/constants'
import { PromptType } from 'types/Prompt'
import { hiddenScrollBarCss } from 'styles/theme/components/scrollbar'
import NavigationBar from 'ui/global/Navigation/NavigationBar'
import useIsMobile from 'shared/hooks/useIsMobile'
import SmallCapsHeading from 'ui/core/SmallCapsHeading'

type Props = {
  tabKey: string
}

export const subTabs = [
  {
    name: 'For you',
    key: 'personal',
    isDefault: true,
    dataTestId: 'prompts-tab-personal',
  },
  {
    name: 'Saved',
    key: 'bookmarks',
    dataTestId: 'prompts-tab-bookmarks',
  },
]

const PromptsComponent = ({ tabKey: urlTabKey }: Props) => {
  const router = useRouter()
  const isMobile = useIsMobile()
  const activeKey = (router.query.tab ||
    urlTabKey ||
    subTabs[0].key) as PromptType

  const handleTabChange = (index: number) => {
    const key = subTabs[index].key
    router.push(`${router.basePath}?tab=${key}`, undefined, {
      shallow: true,
    })
  }

  const defaultIndex = subTabs.findIndex((i) => i.key === activeKey) || 0

  const TabComponent = (
    <TabList
      gap={6}
      w={{ base: 'intitial', md: 'full' }}
      pb={0}
      css={hiddenScrollBarCss()}
      h='full'
      borderBottomWidth={{ base: 0, md: 2 }}
    >
      {subTabs.map((tab) => (
        <Tab
          key={tab.key}
          fontSize='15px'
          px={0}
          // color='brandGray.500'
          // _selected={{
          //   fontWeight: 500,
          //   color: 'brandGray.800',
          //   borderBottom: '2px solid',
          // }}
          whiteSpace='nowrap'
          data-testid={`prompts-tab-${tab.key}`}
          _active={{
            bg: 'transparent',
          }}
        >
          {tab.name}
        </Tab>
      ))}
    </TabList>
  )

  return (
    <Tabs defaultIndex={defaultIndex} onChange={handleTabChange}>
      <NavigationBar title={TabComponent} />
      <Box px={kViewPadding} mb={6} pt={2}>
        {!isMobile && (
          <VStack align='start' mt={8} mb={4}>
            {TabComponent}
          </VStack>
        )}
        <VStack mt={kViewPadding} pb={6} w='full' align='start' spacing={10}>
          {activeKey === 'bookmarks' ? null : <GuidedJournals />}

          <Box w='full'>
            <Flex
              align={{ base: 'start', md: 'center' }}
              mb={{ base: 1, md: 5 }}
              w='full'
              justify='space-between'
              direction={{ base: 'column', md: 'row' }}
              gap={{ base: 4, md: 0 }}
            >
              <SmallCapsHeading mb={{ base: 2, md: 0 }}>
                Personalized Prompts
              </SmallCapsHeading>
            </Flex>
            <PersonalizedPrompts tabKey={activeKey} />
          </Box>
        </VStack>
      </Box>
    </Tabs>
  )
}

export default PromptsComponent
