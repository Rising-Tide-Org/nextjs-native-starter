import {
  Box,
  Button,
  HStack,
  Input,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react'
import { kCollectionPathMap } from 'constants/firebase'
import { fetchMany } from 'db/fetch'
import { createRecordBatch, deleteRecordBatch } from 'db/mutate'
import { query } from 'firebase/firestore'
import moment from 'moment'
import { checkMigrations } from 'net/firestore'
import { useUserProvider } from 'providers/UserProvider'
import { useCallback, useRef } from 'react'
import { CollectionPath } from 'types/Firebase'
import { Migration } from 'types/Migration'
import MakeToast from 'ui/core/MakeToast'

const ImportExportSettings = () => {
  const { updateUserFields } = useUserProvider()
  const ref = useRef<HTMLInputElement | null>(null)
  const toast = useToast()

  const handleExport = useCallback(async () => {
    // download
    const data: Record<string, any> = {}
    for (const collection of Object.keys(kCollectionPathMap)) {
      try {
        data[collection] = await fetchMany(collection as CollectionPath, (q) =>
          query(q)
        )
      } catch (error) {
        console.error(`Error exporting ${collection}:`, error)
      }
    }

    // export
    const filename = `rosebud-${moment().format('YYYY-MM-DD_HH-mm-ss')}`
    const dataStr = JSON.stringify(data, null, 4) // make it pretty
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', filename)
    linkElement.click()
    linkElement.remove()

    toast(
      MakeToast({
        title: 'Export complete',
        status: 'success',
      })
    )
  }, [toast])

  const handleImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return
      const file = e.target.files[0]

      const reader = new FileReader()

      // Closure to capture the file information.
      reader.onload = async function (e) {
        const contents = e.target?.result
        if (contents) {
          const data: Record<CollectionPath, any[]> = JSON.parse(
            contents as string
          )
          const pathDocuments = Object.entries(data)
          if (pathDocuments.length) {
            // Reset migrations before import
            const migrations = await fetchMany<Migration>('migrations', (q) =>
              query(q)
            )
            await deleteRecordBatch(
              'migrations',
              migrations.map((m) => m.id)
            )
          }

          for (const [path, documents] of pathDocuments) {
            try {
              await createRecordBatch(path as CollectionPath, documents)
            } catch (error) {
              console.error(error)
            }
          }

          await updateUserFields({
            'metadata.backfilledVectors': false, // reset vector backfill on import
            migrationNumber: data['migrations']?.length ?? 0,
          })

          // Run migrations after import
          await checkMigrations()

          toast(
            MakeToast({
              title: 'Import complete',
              status: 'success',
            })
          )
        } else {
          toast(
            MakeToast({
              title: 'Import failed',
              status: 'error',
            })
          )
        }
      }

      // Read in the file as text.
      reader.readAsText(file)
    },
    [toast]
  )

  const handleImportClick = useCallback(() => {
    ref.current?.click()
  }, [])

  return (
    <Box>
      <Box>
        <VStack align='start' spacing={4}>
          <Text fontSize='md'>Transfer your journal between devices.</Text>
          <HStack width={'full'}>
            <Button onClick={() => handleExport()} variant='outline'>
              Export
            </Button>
            <Button onClick={() => handleImportClick()} variant='outline'>
              Import
            </Button>
            <Input type='file' ref={ref} onChange={handleImport} hidden />
          </HStack>
        </VStack>
      </Box>
    </Box>
  )
}

export default ImportExportSettings
