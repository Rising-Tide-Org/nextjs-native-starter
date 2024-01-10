import { firestore } from 'firebase-admin'
import { Timestamp } from 'firebase/firestore'
import moment from 'moment'
import { CollectionItemTopic } from 'types/Collection'
import { Emotion, Entry, Person } from 'types/Entry'
import { MigrationMetadata } from 'types/Migration'
import { User } from 'types/User'
import { titleCase } from 'util/string'
import { RunnableMigration } from './RunnableMigration'

/**
 * The class name will be used to indicate this migration in firestore.
 * Use the following filename format to keep things organized: <migrationIndex>_<className>
 */
export class CreateTopics extends RunnableMigration {
  className = 'CreateTopics'

  processTopic(
    entity: Emotion | Person | string,
    entry: Entry,
    type: 'emotion' | 'person' | 'theme',
    topics: CollectionItemTopic[],
    entryTags: { [key: string]: CollectionItemTopic[] }
  ) {
    const entryCreatedAt = entry.date
      ? moment(entry.date).toDate()
      : moment().toDate()

    const title =
      type === 'emotion'
        ? titleCase((entity as Emotion)?.label ?? '')
        : type === 'person'
        ? titleCase((entity as Person)?.name ?? '')
        : titleCase((entity as string) ?? '')
    const topic: CollectionItemTopic = {
      type: 'topic',
      title: title,
      emoji: (entity as Emotion)?.emoji ?? null,
      createdAt: firestore.Timestamp.fromDate(entryCreatedAt) as Timestamp,
      updatedAt: firestore.Timestamp.now() as Timestamp,
      metadata: {
        type: type,
        isFocusArea: false,
        mentions: 1,
      },
    }

    // Add topic to entryTags
    entryTags[entry.id!].push({
      type: 'topic',
      title: topic.title,
      metadata: { type: type },
    })

    // Update or add topic in topics array
    const existingTopic = topics.find((t) => t.title === topic.title)
    if (existingTopic) {
      if (existingTopic?.metadata.mentions) {
        existingTopic.metadata.mentions += 1
      }
    } else {
      topics.push(topic)
    }
  }

  async up(
    trx: firestore.Transaction,
    userRef: firestore.DocumentReference<firestore.DocumentData>
  ): Promise<MigrationMetadata | undefined> {
    const user = (await userRef.get()).data() as User
    if (user.metadata?.migratedTags) {
      return
    }

    const entriesSnapshot = await trx.get(
      userRef.collection('entries').limit(1000)
    )

    // Potential bug: somehow some entries are missing an id
    // So we hydrate it on the fly here
    const entries = entriesSnapshot.docs.map((doc) => {
      return {
        ...doc.data(),
        id: doc.id,
      } as Entry
    })

    const topics: CollectionItemTopic[] = []
    const entryTags: { [key: string]: CollectionItemTopic[] } = {}
    // Create topics and tags
    for (const entry of entries) {
      if (entry.tags?.length) {
        continue
      }

      entryTags[entry.id!] = []
      for (const emotion of entry.entities?.emotions ?? []) {
        this.processTopic(emotion, entry, 'emotion', topics, entryTags)
      }

      for (const theme of entry.entities?.topics ?? []) {
        this.processTopic(theme, entry, 'theme', topics, entryTags)
      }

      for (const person of entry.entities?.people ?? []) {
        this.processTopic(person, entry, 'person', topics, entryTags)
      }
    }

    if (topics.length === 0) {
      return
    }

    // Create topics
    for (const topic of topics) {
      const topicRef = userRef.collection('items').doc()
      topic.id = topicRef.id
      trx.set(topicRef, topic)
    }

    // Update entries with tags
    for (const [entryId, tags] of Object.entries(entryTags)) {
      const entryRef = userRef.collection('entries').doc(entryId)

      const updatedTags = tags.map((tag) => {
        const createdTag = topics.find((t) => t.title === tag.title)
        return createdTag ? { ...tag, id: createdTag.id } : tag
      })

      trx.update(entryRef, {
        tags: updatedTags,
        tagIndex: updatedTags.map((t) => t.id),
      })
    }

    // Update user metadata
    trx.update(userRef, { 'metadata.migratedTags': true })

    return {
      entriesUpdated: Object.keys(entryTags ?? {}).length,
      topicsCreated: topics.length,
    }
  }
}
