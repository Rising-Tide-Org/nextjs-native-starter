import { CollectionItemTopic } from 'types/Collection'
import { Entities } from 'types/Entry'
import { titleCase } from './string'

export const convertEntitiesToTags = (
  entities: Entities
): CollectionItemTopic[] => {
  const tags: CollectionItemTopic[] = []

  for (const emotion of entities.emotions ?? []) {
    const topic: CollectionItemTopic = {
      type: 'topic',
      title: titleCase(emotion.label),
      emoji: emotion.emoji,
      metadata: {
        type: 'emotion',
      },
    }

    tags.push(topic)
  }

  for (const theme of entities.topics ?? []) {
    const topic: CollectionItemTopic = {
      type: 'topic',
      title: titleCase(theme),
      metadata: {
        type: 'theme',
      },
    }

    tags.push(topic)
  }

  for (const person of entities?.people ?? []) {
    const topic: CollectionItemTopic = {
      type: 'topic',
      title: titleCase(person.name),
      metadata: {
        type: 'person',
        relation: person.relation,
      },
    }

    tags.push(topic)
  }

  return tags
}
