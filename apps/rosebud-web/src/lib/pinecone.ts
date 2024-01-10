import { Index, Pinecone } from '@pinecone-database/pinecone'
import { initializeAdmin } from 'db-server'
import { fetchMany } from 'db-server/fetch'
import { firestore } from 'firebase-admin'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import moment from 'moment'
import { Entry } from 'types/Entry'
import {
  CombinedEntryVector,
  EntryChunkingMode,
  EntryVector,
  EntryVectorMetadata,
  TimestampRange,
} from 'types/EntryVector'
import { splitArrayIntoChunks } from 'util/array'
import { chunkStringAtPeriod } from 'util/string'
import { formatQuestionForVectorDatabase } from '../util/entries'

const kMaxTopK = 20

/**
 * Indexes entries in Pinecone
 * @param client PineconeClient
 * @param userUuid uuid of user
 * @param entries entries to index
 */
export const indexEntries = async (
  client: Pinecone,
  userUuid: string,
  entries: Entry[]
): Promise<number> => {
  const index = client.Index<EntryVectorMetadata>('entries')

  const questionVectors = await createVectorsFromEntries(entries, userUuid)
  return await upsertVectorsBatch(index, questionVectors)
}

const createVectorsFromEntries = async (
  entries: Entry[],
  userUuid: string
): Promise<EntryVector[]> => {
  const chunkingMode = EntryChunkingMode.PerQuestion
  const metadata: EntryVectorMetadata[] = []
  const contents: string[] = []

  entries.forEach((e) =>
    e.questions.forEach((question, idx) => {
      const startOfDay = moment(e.date).startOf('day') // using start of day to decrease cardinality and improve Pinecone index performance
      const resposeSubtrings = chunkStringAtPeriod(question.response.join('\n')) // could chunk back to the last period
      let startIndex = 0
      resposeSubtrings.forEach((substr) => {
        if (!substr.length) return

        const endIndex = startIndex + substr.length
        const substringRange =
          resposeSubtrings.length > 1 ? [startIndex, endIndex] : []
        metadata.push({
          userUuid,
          date: startOfDay.toISOString(),
          timestamp: startOfDay.unix(),
          entryId: e.id!,
          questionIndices: `${idx}`,
          responseSubstringRange: substringRange.join(','),
          chunkingMode: EntryChunkingMode.PerQuestion,
        })
        contents.push(
          formatQuestionForVectorDatabase(question, e.date, substringRange)
        )
        startIndex = endIndex + 1
      })
    })
  )

  // create embeddings from content
  const embeddingsArrays = await new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  }).embedDocuments(contents.map((c) => c.replace(/\n/g, ' ')))

  // create vectors
  const vectors: EntryVector[] = metadata.map((md, idx) => {
    return {
      id: [
        chunkingMode,
        md.entryId,
        md.questionIndices ?? null,
        md.responseSubstringRange ?? null,
      ]
        .filter((item) => item?.length)
        .join('_'),
      values: embeddingsArrays[idx],
      metadata: {
        ...md,
      },
    }
  })

  return vectors
}

const upsertVectorsBatch = async (
  index: Index<EntryVectorMetadata>,
  vectors: EntryVector[],
  batchSize = 100
): Promise<number> => {
  console.info('Vectors queued for upsert:', vectors.length)
  const batches = splitArrayIntoChunks(vectors, batchSize)
  const promises = batches.map((batch) => index.upsert(batch))
  const res = await Promise.allSettled(promises)
  console.info('Vectors upserted:', JSON.stringify(res))
  return vectors.length
}

/**
 *
 * @param client PineconeClient
 * @param userUuid
 * @param query
 * @param topK How many vectors to return
 * @param chunkingMode
 * @returns
 */
export const queryEntries = async (
  client: Pinecone,
  userUuid: string,
  query: string,
  topK = 3,
  memoryRange?: TimestampRange
): Promise<EntryVector[]> => {
  const index = client.Index<EntryVectorMetadata>('entries')
  const queryEmbedding = await new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  }).embedQuery(query)

  const before = Number(memoryRange?.before)
  const after = Number(memoryRange?.after)
  let timestamp = null
  if (before && after) {
    timestamp = { $and: [{ $gte: after }, { $lte: before }] }
  } else if (before || after) {
    timestamp = {
      ...(after && { timestamp: { $gte: after } }),
      ...(before && { timestamp: { $lte: before } }),
    }
  }

  const queryResponse = await index.query({
    topK, // number of vectors to return
    vector: queryEmbedding,
    includeMetadata: true, // we only need the metadata
    includeValues: false,
    filter: {
      userUuid,
      chunkingMode: EntryChunkingMode.PerQuestion,
      ...(timestamp && { ...timestamp }),
    },
  })

  return queryResponse?.matches?.map((match) => match as EntryVector) ?? []
}

/**
 * Query vector database and return array of semantically relevant ComposeResponse objects
 */
export const fetchMemories = async (
  userId: string,
  userUuid: string,
  query: string,
  topK = 10,
  memoryRange?: TimestampRange
): Promise<Entry[]> => {
  // Establish Pinecone client
  const client = new Pinecone()

  // Pinecone query
  const vectorData = await queryEntries(
    client,
    userUuid,
    query, // The query that's sent to Pinecone.
    Math.min(topK, kMaxTopK), // number of vectors to return
    memoryRange
  )

  // Prepare vector results for Firestore query
  const entryVectors: Record<string, CombinedEntryVector> = {}
  vectorData
    ?.filter((v) => v.metadata.entryId)
    .forEach((v) => {
      const md = v.metadata
      const idxs = md.questionIndices?.split(',').map(Number)
      if (idxs) {
        if (!entryVectors[md.entryId]) {
          entryVectors[md.entryId] = {
            id: md.entryId,
            date: md.date,
            score: v.score,
            questionIds: [],
            questionResponseRanges: {},
          }
        }
        entryVectors[md.entryId].questionIds.push(...idxs)
        idxs.forEach((idx) => {
          entryVectors[md.entryId].questionResponseRanges![idx] =
            md.responseSubstringRange?.split(',').map(Number)
        })
      }
    })

  // Firestore IN query has 10 doc limit. We want to pull all entries in batches.
  const app = await initializeAdmin()
  const db = await app.firestore()

  const entryIds = Object.keys(entryVectors)
  const batchSize = 10
  const requests = []
  for (let i = 0; i < entryIds.length; i += batchSize) {
    const ids = entryIds.slice(i, i + batchSize)
    requests.push(
      fetchMany<Entry>(
        db,
        'entries',
        (q) => q.where(firestore.FieldPath.documentId(), 'in', ids),
        userId
      )
    )
  }
  const res = await Promise.all(requests)
  const entries = res.flatMap((r) => r.data)

  // Extract memories from entries
  const memories: Entry[] = []
  if (entries) {
    entries
      .sort((a, b) => (a.date ?? '')?.localeCompare(b.date ?? ''))
      .forEach((entry) => {
        const vector = entryVectors[entry.id!]
        const questionIds = vector?.questionIds
        questionIds.forEach((idx) => {
          const question = entry.questions[idx]
          // Skip if question has no response
          if (!question.response || question.response.length === 0) return

          let response = question.response

          const substrRange = vector.questionResponseRanges?.[idx]
          if (substrRange?.length) {
            // Extract substring if present
            response = [
              question.response
                .join('\n')
                .substring(substrRange?.[0], substrRange?.[1]),
            ]
          }

          // Only grab the last line of the prompt (the question)
          memories.push({
            id: entry.id!,
            day: entry.day!,
            summary: {
              title: entry.summary?.title ?? '',
              content: '',
            },
            commitments: [],
            questions: [
              {
                date: entry.date,
                prompt: {
                  ...question.prompt,
                  content: question.prompt.content.slice(-1),
                },
                response,
              },
            ],
          })
        })
      })
  }

  return memories
}

/**
 * Deletes all vectors in Pinecone for given user uuid
 * @param userUuid
 */
export const deleteVectorsForUser = async (userUuid: string): Promise<void> => {
  const client = new Pinecone()
  const index = client.Index<EntryVectorMetadata>('entries')
  await index.deleteMany({ userUuid })
}
