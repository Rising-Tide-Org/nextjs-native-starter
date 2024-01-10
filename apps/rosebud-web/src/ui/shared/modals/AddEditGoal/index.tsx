import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Select,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react'
import { fetchOne } from 'db/fetch'
import routes from 'lib/routes'
import router from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import {
  CollectionItemGoal,
  CollectionItemGoalInterval,
} from 'types/Collection'
import { Entry } from 'types/Entry'
import { ListView } from 'ui/core/ListView'
import { ListViewItem } from 'ui/core/ListView/ListViewItem'
import Panel from 'ui/core/Panel'
import TopBar from 'ui/global/TopBar'
import MemoryListViewItem from 'ui/pages/lifemap/TopicPage/MemoryListViewItem'
import DrawerOrModal from '../DrawerOrModal'

type Mode = 'add' | 'edit'

type Props = {
  goal?: CollectionItemGoal | Partial<CollectionItemGoal> | null
  mode: Mode
  isOpen: boolean
  isWorking?: boolean
  onAdd: (goal: Partial<CollectionItemGoal>) => void
  onEdit?: (goal: CollectionItemGoal) => void
  onDelete?: (goal: Partial<CollectionItemGoal>) => void
  onClose: () => void
}

// copy is TBD
const titles: Record<Mode, string> = {
  add: 'Add to Happiness Recipe',
  edit: 'Edit Ingredient',
}

const ctaLabels: Record<Mode, string> = {
  add: 'Add Ingredient',
  edit: 'Save Changes',
}

const defaultInterval: CollectionItemGoalInterval = 'once'
const defaultCompletionRate = 3

const AddEditGoalModal = ({
  isOpen,
  isWorking,
  onClose,
  mode,
  goal,
  onAdd,
  onEdit,
  onDelete,
}: Props) => {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [interval, setInterval] =
    useState<CollectionItemGoalInterval>(defaultInterval)
  const [rate, setRate] = useState<number>(defaultCompletionRate)
  const [entry, setEntry] = useState<Entry | null>(null)

  const title = titles[mode]
  const ctaLabel = ctaLabels[mode]
  const ctaDisabled = !name.length

  const onSubmitForm = () => {
    if (mode === 'add') {
      onAdd({
        title: name,
        description: desc,
        metadata: {
          interval,
          completionsRequired: rate,
        },
      })
    } else if (goal) {
      onEdit?.({
        ...goal,
        title: name,
        description: desc,
        metadata: {
          ...goal.metadata,
          interval,
          completionsRequired: rate,
        },
      } as CollectionItemGoal)
    }
  }

  useEffect(() => {
    async function getRelatedEntry(docId: string) {
      const entry = await fetchOne<Entry>('entries', docId)
      setEntry(entry)
    }

    setName(goal?.title ?? '')
    setDesc(goal?.description ?? '')
    setInterval(goal?.metadata?.interval ?? defaultInterval)
    setRate(goal?.metadata?.completionsRequired ?? defaultCompletionRate)

    if (goal?.references?.entries?.[0]) {
      getRelatedEntry(goal?.references?.entries?.[0])
    }
  }, [goal])

  const handleEntry = useCallback(
    (entry: Entry) => {
      router.push(routes.entry(entry.id!), undefined, { shallow: true })
    },
    [router]
  )

  return (
    <DrawerOrModal
      isOpen={isOpen}
      // why do we make this a required prop?
      onOpen={() => {}}
      onClose={onClose}
      closeOnEsc={false}
    >
      <TopBar title={title} hideBackButton />

      <form onSubmit={onSubmitForm}>
        <VStack p={4} pb={{ base: 6, md: 4 }} mx={2} spacing={4}>
          <FormControl>
            <VStack>
              <FormLabel alignSelf='start'>Name</FormLabel>
              <Input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='A task, habit, or goal...'
                maxLength={50}
              />
            </VStack>
          </FormControl>

          <FormControl>
            <VStack>
              <FormLabel alignSelf='start'>Frequency</FormLabel>

              <HStack w='100%'>
                <Select
                  value={interval}
                  onChange={(e) => {
                    const interval = e.target
                      .value as CollectionItemGoalInterval
                    setInterval(interval)
                    // so a suggestion initially once or forever with a rate of 0
                    // then changed to weekly gets a non-zero rate
                    if (interval === 'weekly' && !rate) {
                      setRate(defaultCompletionRate)
                    }
                  }}
                >
                  <option value='once'>Once</option>
                  <option value='weekly'>Weekly</option>
                  <option value='forever'>Forever</option>
                </Select>
                {interval === 'weekly' && (
                  <Select
                    value={rate?.toString()}
                    onChange={(e) => setRate(parseInt(e.target.value))}
                  >
                    {[...Array(7)].map((_, index) => (
                      <option value={index + 1} key={index}>
                        {index + 1} time{index > 0 ? 's' : ''}
                      </option>
                    ))}
                  </Select>
                )}
              </HStack>
            </VStack>
          </FormControl>

          <FormControl>
            <VStack>
              <FormLabel alignSelf='start'>Description</FormLabel>
              <Textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                maxLength={200}
              />
            </VStack>
          </FormControl>

          {entry ? (
            <FormControl>
              <VStack>
                <FormLabel alignSelf='start'>Entry</FormLabel>
                <Panel p={0}>
                  <ListView>
                    <ListViewItem
                      key={entry.id}
                      onClick={() => handleEntry(entry)}
                    >
                      <MemoryListViewItem entry={entry} />
                    </ListViewItem>
                  </ListView>
                </Panel>
              </VStack>
            </FormControl>
          ) : null}

          <Button
            variant='primary'
            isDisabled={ctaDisabled}
            isLoading={isWorking}
            onClick={onSubmitForm}
          >
            {ctaLabel}
          </Button>

          {mode === 'edit' && (
            <Text
              cursor='pointer'
              color='brandGray.400'
              onClick={() => {
                if (goal) onDelete?.(goal)
              }}
              _hover={{ color: 'brandGray.700' }}
            >
              Delete
            </Text>
          )}
        </VStack>
      </form>
    </DrawerOrModal>
  )
}

export default AddEditGoalModal
