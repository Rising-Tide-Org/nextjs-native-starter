import { Text, VStack } from '@chakra-ui/react'
import { useEntryProvider } from 'providers/EntryProvider'
import Panel from 'ui/core/Panel'
import SmallCapsHeading from 'ui/core/SmallCapsHeading'

const InsightList = () => {
  const { entries } = useEntryProvider()

  return (
    <VStack pl={{ base: 0, md: 8 }} align='start'>
      <SmallCapsHeading>Recent Insights</SmallCapsHeading>
      {[...entries.reverse()]
        .filter((e) => Boolean(e.summary))
        .slice(-5)
        .map((entry) => {
          let keyInsight =
            entry.summary?.content?.split(
              /Key insight:|Initial thought:/i
            )[1] ?? ''

          if (entry.templateId === 'reframing') {
            keyInsight = 'Initial thought: ' + keyInsight
          }

          return (
            <Panel key={entry.id} variant='vstack' gap={2}>
              <Text fontWeight={500}>{entry.summary?.title}</Text>

              <Text>{keyInsight}</Text>
            </Panel>
          )
        })}
    </VStack>
  )
}

export default InsightList
