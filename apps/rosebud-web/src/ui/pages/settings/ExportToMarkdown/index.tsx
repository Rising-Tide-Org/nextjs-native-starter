import { Box, Button, HStack, Text, useToast, VStack } from '@chakra-ui/react'
import { fetchMany } from 'db/fetch'
import { query } from 'firebase/firestore'
import Analytics from 'lib/analytics'
import moment from 'moment'
import { useState } from 'react'
import { Entry } from 'types/Entry'
import MakeToast from 'ui/core/MakeToast'
import { getEntryAsMarkdown } from 'util/entries'
import { downloadFile } from 'util/fs'

const ExportToMarkdown = () => {
  const toast = useToast()
  const [isLoading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)

    let entries: Entry[] = []

    try {
      entries = await fetchMany('entries', query)
    } catch (error) {
      Analytics.trackEvent('journal.export.error')
      toast(
        MakeToast({
          title: 'There was a problem retrieving entries',
          status: 'error',
        })
      )
      return
    }

    if (!entries.length) {
      toast(
        MakeToast({
          title: 'No entries to export',
          status: 'info',
        })
      )
      setLoading(false)
      return
    }

    // ensure sorted newest to oldest
    entries.sort((a, b) => {
      if (!a.day || !b.day) return 0
      return moment(b.date).diff(moment(a.date))
    })

    const dateFormat = 'MMMM D, YYYY'
    const newest = moment(entries[0].day).format(dateFormat)
    const oldest = moment(entries[entries.length - 1].day).format(dateFormat)

    let entriesMarkdown = `
# 🌹 Rosebud entries

### ${oldest} - ${newest}

---`

    entries.forEach((entry, index) => {
      entriesMarkdown = entriesMarkdown.concat(`
${index > 0 ? '---' : ''}
${getEntryAsMarkdown(entry)}
      `)
    })

    const fileName = `rosebud-${moment().format('YYYY-MM-DD_HH-mm-ss')}.md`

    try {
      downloadFile(fileName, entriesMarkdown)
      Analytics.trackEvent('journal.export.success')
      toast(
        MakeToast({
          title: 'Export complete',
          status: 'success',
        })
      )
    } catch (e) {
      Analytics.trackEvent('journal.export.error')
      toast(
        MakeToast({
          title: 'Export error',
          status: 'error',
        })
      )
    }

    setLoading(false)
  }

  return (
    <Box>
      <Box>
        <VStack align='start' spacing={4}>
          <Text fontSize='md'>
            Retrieve a markdown file of all your entries.
          </Text>
          <HStack width={'full'}>
            <Button
              onClick={handleExport}
              variant='outline'
              isLoading={isLoading}
            >
              Export
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  )
}

export default ExportToMarkdown
