import moment from 'moment'
import { ChatCompletionMessageParam } from 'openai/resources'
import { CollectionItemTopic } from 'types/Collection'
import { ComposeResponse, ComposeTemplate } from 'types/Compose'
import { Entry } from 'types/Entry'
import { Identifiable } from 'types/Generic'
import { Goal } from 'types/Goal'
import { getWeekDateRange } from './date'

/**
 * This is temporary adapter helper between the new compose
 * response format and the old entry format.
 */
export const entriesFromComposeState = (
  responses: ComposeResponse[],
  commitments: Goal[],
  template: ComposeTemplate
): Entry[] => {
  let filteredResponses = responses

  if (template.entryBeginsAtPromptId !== undefined) {
    const aiPromptIndex = responses.findIndex(
      (response) => response.prompt.id === template.entryBeginsAtPromptId
    )

    if (aiPromptIndex !== -1) {
      filteredResponses = responses.slice(aiPromptIndex)
    }
  }

  return [
    {
      questions: filteredResponses,
      commitments: commitments.map((c) => c.name),
    },
  ]
}

/**
 * Calculate the total length of all responses in compose
 */
export const entryLength = (entries: Entry[]): number => {
  return entries.reduce((acc, entry) => {
    return (
      acc +
      (entry.questions?.reduce(
        (acc, q) =>
          acc +
          q.prompt.content.join('\n').length +
          q.response.join('\n').length,
        0
      ) ?? 0)
    )
  }, 0)
}

/**
 * Calculate the total word count of all responses in entry
 */
export const entryWordCount = (entry: Entry | Entry[]): number => {
  if (Array.isArray(entry)) {
    return entry.map((e) => entryWordCount(e)).reduce((a, b) => a + b, 0)
  }

  return entry.questions
    .map((q) => q.response.join(' '))
    .join(' ')
    .split(/\s+/g).length
}

type TagCount = {
  tag: CollectionItemTopic
  count: number
}

type TagCountByType = {
  [type: string]: TagCount[]
}

export const entryTopTagsByType = (entries: Entry[]) => {
  // Step 1: Reduce to count the tags
  const tagCounts = entries
    .flatMap((e) => e.tags)
    .reduce<TagCountByType>((acc, tag) => {
      if (!tag) return acc // Skip if tag is undefined

      const type = tag.metadata.type
      const id = tag.id

      if (!acc[type]) {
        acc[type] = []
      }

      const existingTagIndex = acc[type].findIndex((t) => t.tag.id === id)
      if (existingTagIndex !== -1) {
        acc[type][existingTagIndex].count += 1
      } else {
        acc[type].push({ tag, count: 1 })
      }

      return acc
    }, {})

  // Step 2-5: For each type, sort the tag counts and take the top 5
  const topTagsByType = Object.keys(tagCounts).reduce((sortedAcc, type) => {
    // Sort by count in descending order and slice the top 5
    const topTags = tagCounts[type]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    sortedAcc[type] = topTags
    return sortedAcc
  }, {} as TagCountByType)

  return topTagsByType
}

/**
 * Convert entries into ChatCompletionMessageParam
 */
export const formatEntriesForChatCompletion = (
  entries: Entry[]
): ChatCompletionMessageParam[] => {
  return entries
    .map((entry) =>
      entry.questions
        .map((question) => [
          {
            role: 'assistant',
            content: question.prompt.content.join('\n'),
          },
          {
            role: 'user',
            content: question.response.join('\n'),
          },
        ])
        .flat()
    )
    .flat() as ChatCompletionMessageParam[]
}

/**
 * Formats an entry into a string that can be used as a prompt
 */
export const formatEntryForVectorDatabase = (entry: Entry): string => {
  return entry.questions
    ?.map((question) => formatQuestionForVectorDatabase(question, entry.date))
    .join('')
}

export const formatQuestionForVectorDatabase = (
  question: ComposeResponse,
  date?: string,
  substringRange?: number[]
): string => {
  const dateString = question.date ?? date
  let response = question.response.join('\n')
  if (substringRange?.length) {
    response = response.substring(substringRange?.[0], substringRange?.[1])
  }
  return `${dateString ? moment(dateString).format('MMMM Do, YYYY') : ''}
  Assistant: ${question.prompt.content.join('\n')}
  User: ${response}
  `
}

/**
 * Formats an entry into a string that can be used as a prompt
 */
export const formatEntriesForWeeklyReport = (entries: Entry[]): string =>
  entries
    .map(
      (entry) => `\n\n${moment(entry.date).format('MMMM Do, YYYY')}
    ${entry.questions
      .filter((question) => question.response[0]?.length > 0)
      .map(
        (question) => `

Q: ${question.prompt.content.slice(-1).join('\n')}
A: ${question.response.join('\n')}
`
      )
      .join('')}`
    )
    .join('')

/**
 * Group an array (e.g. of entries) by week for display in the journal
 * @param data Array of data
 * @param key Date key to group by
 * @param draftsMap Drafts map to determine if item is a draft
 * @returns Object with keys of week labels and values of arrays of data
 */
export const groupArrayByKey = <T extends Identifiable>(
  data: T[],
  key: keyof T,
  secondaryKey?: {
    key: keyof T
    value: string | number | boolean
    groupKey: string
  }
): { [key: string]: T[] } => {
  const groupedByWeek: { [key: string]: T[] } = {}

  const { primary, secondary } = data.reduce(
    (acc, item) => {
      if (
        secondaryKey &&
        item?.id &&
        item?.[secondaryKey.key] === secondaryKey.value
      ) {
        acc.secondary.push(item)
      } else {
        acc.primary.push(item)
      }
      return acc
    },
    { primary: [] as T[], secondary: [] as T[] }
  )

  primary.forEach((element) => {
    if (!element[key]) {
      return
    }

    const weekLabel = moment(element[key] as string).format('YYYY-WW')

    if (!groupedByWeek[weekLabel]) {
      groupedByWeek[weekLabel] = []
    }

    groupedByWeek[weekLabel].push(element)
  })

  if (secondaryKey && secondary.length) {
    return {
      [secondaryKey.groupKey]: secondary,
      ...groupedByWeek,
    }
  }

  return groupedByWeek
}

/**
 * Get the week label for a given date
 * e.g. Aug 1st - Aug 7th
 */

export const getWeekLabel = (date: Date, relative = true) => {
  const [startOfThisWeek] = getWeekDateRange(new Date())
  const [startOfLastWeek] = getWeekDateRange(
    moment().subtract(1, 'week').toDate()
  )

  const [startOfWeek, endOfWeek] = getWeekDateRange(date)

  let weekLabel = ''

  if (moment(startOfWeek).isSame(startOfThisWeek, 'week') && relative) {
    weekLabel = 'This week'
  } else if (moment(startOfWeek).isSame(startOfLastWeek, 'week') && relative) {
    weekLabel = 'Last week'
  } else {
    weekLabel = `${moment(startOfWeek).format('MMM Do')} - ${moment(
      endOfWeek
    ).format('MMM Do')}`
  }

  return weekLabel
}

export const getEntryAsMarkdown = (entry: Entry) => {
  const getPrompt = (content: string[]) => {
    let prompt = ''
    content.forEach((c, i) => {
      const newLine = i < content.length - 1 ? '\n' : ''
      // wrapping each line in a span otherwise lines apart of numbered
      // lists (which chatgpt is fond of) will lose their color style.
      prompt = prompt.concat(`>${c}${newLine}`)
    })
    return prompt
  }

  const getQuestions = (responseSets: ComposeResponse[]) => {
    let questions = ''
    responseSets.forEach((question) => {
      questions = questions.concat(`
${getPrompt(question.prompt.content)}
  
${question.response}
`)
    })
    return questions
  }

  const date = moment(entry.day).format('dddd, MMMM Do, YYYY')

  return `
## ${entry.summary?.title ?? 'Untitled'}
### ${date}
${getQuestions(entry.questions)}`
}

export const isPromptUsedByDraftEntries = (
  promptId: string,
  drafts: Entry[] = []
) => {
  // make sure the implementor didn't pass us any entries that aren't actually drafts
  drafts = drafts.filter((entry) => entry.isDraft)

  return drafts.some((draft) =>
    Boolean(
      draft.questions.find(
        (question) => question.prompt.id === `prompt-${promptId}`
      )
    )
  )
}
