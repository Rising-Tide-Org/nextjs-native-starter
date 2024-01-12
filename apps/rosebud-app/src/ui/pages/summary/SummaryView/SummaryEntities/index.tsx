import { Box, Flex, TagLabel, TagLeftIcon } from '@chakra-ui/react'
import { useCallback, useMemo } from 'react'
import { BsFillPersonFill } from 'react-icons/bs'
import EntityGroup from './EntityGroup'
import EntityTag from './EntityTag'
import { CollectionItemTopic } from 'types/Collection'
import AddEntityTag from './AddEntityTag'
import { updateRecord } from 'db/mutate'
import { arrayRemove, increment } from 'firebase/firestore'
import { Entry } from 'types/Entry'
import useFetchOne from 'shared/hooks/useFetchOne'
import Analytics from 'lib/analytics'

type Props = {
  entryId: string
  entities: CollectionItemTopic[]
  animate?: boolean
  navigable?: boolean // Whether to navigate to the lifemap page when clicking on an entity
  source?: string // The origin component that is rendering this component
}

const SummaryEntities = ({
  entryId,
  entities,
  animate = false,
  navigable = false,
  source,
}: Props) => {
  const { data: entry } = useFetchOne<Entry>('entries', entryId, {
    subscribe: true,
  })

  const tags = useMemo(
    () => entry?.tags ?? entities ?? [],
    [entities, entry?.tags]
  )

  // Index used to animate the staggered entrance of the entity groups
  let index = -1

  /**
   * Remove a tag from the entry
   */
  const handleRemove = useCallback(
    async (tag: CollectionItemTopic) => {
      Analytics.trackEvent('entry.tag.remove', { source })
      try {
        await updateRecord<Entry>('entries', entryId, {
          tags: arrayRemove(tag),
          tagIndex: arrayRemove(tag.id),
        })
        await updateRecord<CollectionItemTopic>(
          'items',
          tag.id!,
          {},
          {
            'metadata.mentions': increment(-1),
          }
        )
        Analytics.trackEvent('entry.tag.remove.success', {
          source,
        })
      } catch (error) {
        Analytics.trackEvent('entry.tag.remove.error', {
          source,
          error: error.message,
        })
      }
    },
    [entryId, source]
  )

  // Ignore the ones without names
  const peopleWithNames = tags
    .filter((tag) => tag.metadata.type === 'person')
    .filter((tag) => tag.title)
  const emotions = tags.filter((tag) => tag.metadata.type === 'emotion')
  const themes = tags.filter((tag) => tag.metadata.type === 'theme')

  return (
    <Box w='full'>
      <Flex px={4} pt={4} direction='column' gap={5}>
        {emotions.length > 0 && (
          <EntityGroup title='Feelings' index={++index} animate={animate}>
            {emotions.map((item, i) => (
              <EntityTag
                key={i}
                index={i}
                itemId={item.id!}
                animate={animate}
                navigable={navigable}
              >
                {item.emoji} {item.title}
              </EntityTag>
            ))}
          </EntityGroup>
        )}
        <EntityGroup title='People' index={++index} animate={animate}>
          {peopleWithNames?.map((item, i) => (
            <EntityTag
              key={i}
              itemId={item.id!}
              index={i}
              animate={animate}
              navigable={navigable}
              onRemove={() => handleRemove(item)}
              editable
            >
              <TagLeftIcon as={BsFillPersonFill} mr={1} />
              <TagLabel>{item.title}</TagLabel>
            </EntityTag>
          ))}
          <AddEntityTag
            index={peopleWithNames.length}
            animate={animate}
            type='person'
            entryId={entryId}
            existingTags={peopleWithNames}
            source={source}
          />
        </EntityGroup>
        <EntityGroup title='Topics' index={++index} animate={animate}>
          {themes?.map((item, i) => (
            <EntityTag
              key={i}
              index={i}
              itemId={item.id!}
              animate={animate}
              navigable={navigable}
              onRemove={() => handleRemove(item)}
              editable
            >
              {item.title}
            </EntityTag>
          ))}
          <AddEntityTag
            index={peopleWithNames.length}
            animate={animate}
            type='theme'
            entryId={entryId}
            existingTags={themes}
            source={source}
          />
        </EntityGroup>
      </Flex>
    </Box>
  )
}

export default SummaryEntities
