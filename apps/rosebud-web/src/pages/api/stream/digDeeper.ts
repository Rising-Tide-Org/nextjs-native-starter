// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { kv } from '@vercel/kv'
import {
  kFreeDigDeeperHardLimitPerDay,
  kFreeDigDeeperSoftLimitPerDay,
  kMaxContextWindowCharacters,
  kPremiumDigDeeperHardLimitPerDay,
  kPremiumDigDeeperSoftLimitPerDay,
} from 'constants/limits'
import { kSpeedGPTModel } from 'constants/models'
import { encode } from 'gpt-tokenizer'
import { fetchUserPersonalization } from 'lib/edge/firestore'
import { trackOpenAiUsage } from 'lib/edge/mixpanel'
import { Template } from 'lib/template'
import withStreamMiddleware, {
  NextAuthRequest,
} from 'middleware/withStreamMiddleware'
import { OpenAIStream } from 'net/openai/stream'
import { NextResponse } from 'next/server'
import {
  ChatCompletionCreateParams,
  ChatCompletionMessageParam,
} from 'openai/resources'
import {
  kBioPrompt,
  kDefaultLanguagePrompt,
  kDefaultSystemPrompt,
  kDefaultSystemPromptSuffix,
  kToneAndStylePrompt,
} from 'templates'
import { Experiment } from 'templates/experiment'
import { ComposeResponse } from 'types/Compose'
import { Entry } from 'types/Entry'
import { RateLimit } from 'types/Limit'
import { User } from 'types/User'
import {
  formatEntriesForChatCompletion,
  formatQuestionForVectorDatabase,
} from 'util/entries'
import { getGPTModelForStream } from 'util/models-server-edge'
import { createStreamedApiReponse, trimContextWindow } from 'util/openai'

export const config = {
  runtime: 'edge',
}

const kFunctionName = 'digDeeper'

const handler = async (req: NextAuthRequest): Promise<Response> => {
  let entries, templateId, memories, toneAndStyle, localDate: string
  let user: User

  /**
   * Extract the request data
   */
  try {
    user = req._user!

    const json = (await req.json()) as {
      entries: Entry[]
      templateId: string
      memories: ComposeResponse[]
      localDate: string
    }
    entries = json.entries ?? []
    templateId = json.templateId ?? ''
    memories = json.memories
    localDate = json.localDate
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
  }

  const token = req.cookies.get('token')?.value
  const isPremium = ['active', 'trialing'].includes(
    user?.subscription?.status ?? ''
  )
  let shouldSoftLimit = false
  let dailyDigDeepersUsed = 0

  /**
   * Check rate limits
   */
  if (token && user.id) {
    // If cheaper, we could move this to Redis
    const rateLimits = (await kv.get(user.id + '/' + localDate)) as RateLimit

    dailyDigDeepersUsed = rateLimits?.digDeeper ?? 0

    const digDeeperHardLimit = isPremium
      ? kPremiumDigDeeperHardLimitPerDay
      : kFreeDigDeeperHardLimitPerDay

    const digDeeperSoftLimit = isPremium
      ? kPremiumDigDeeperSoftLimitPerDay
      : kFreeDigDeeperSoftLimitPerDay

    // Check if user reached hard limit
    if (dailyDigDeepersUsed >= digDeeperHardLimit) {
      return NextResponse.json(
        {
          error: 'You have reached your daily limit for dig deeper.',
        },
        { status: 429 }
      )
    }

    // Check if user reached soft limit (triggers model fallback to speed model below)
    shouldSoftLimit = dailyDigDeepersUsed >= digDeeperSoftLimit
  }

  /**
   * Fetch user's personalization if they have one set
   */
  if (token && user.id && user.settings.personalizationId) {
    try {
      const rosebudPersonalization = await fetchUserPersonalization(
        token,
        user.id,
        user.settings.personalizationId
      )
      toneAndStyle = rosebudPersonalization?.toneAndStyle
    } catch (e) {
      console.error(e.message)
    }
  }

  const counterRefusal = Boolean(req.headers.get('counter-refusal'))

  // Dirty, dirty hack. 🥲
  // TODO: We need to build a way for templates to inject system prompts
  // and provide guidance to create better quality follow-ups for templates
  // that have multiple pre-defined prompts in a row in interactive mode.
  const formattedEntries = formatEntriesForChatCompletion(entries)
  const budIndex = entries[0].questions.findIndex((q) => q.prompt.id === 'bud')
  const thornIndex = entries[0].questions.findIndex(
    (q) => q.prompt.id === 'thorn'
  )
  const endIndex = budIndex === -1 ? thornIndex : budIndex

  if (
    endIndex ===
    formattedEntries.filter((e) => e.role === 'assistant').length - 1
  ) {
    formattedEntries.push({
      role: 'system',
      content:
        'Consider the rose bud thorn answers, provide feedback, and ask me about the most important topic I shared.',
    })
  }

  // Change prompt and AI model settings if Advanced AI mode is off
  const inExperiment = user?.settings?.advancedModelEnabled === false

  /**
   * Build the system prompt
   */
  let systemPrompt: string
  let systemPromptSuffix = ''

  const isAsk = Template.isAsk(templateId)

  try {
    if (isAsk) {
      templateId = 'ask'
    }
    // Dynamically import the template's system prompt, if it exists
    const systemPromptFunc = (await import(`templates/${templateId}/system`))
      ?.default as (user: User) => string
    systemPrompt = systemPromptFunc(user)
    // need .default since module uses export default - can alternatively not use default export in module to prevent this
  } catch (error) {
    if (inExperiment) {
      systemPrompt = Experiment.kDefaultSystemPrompt
      systemPromptSuffix = Experiment.kDefaultSystemPromptSuffix
    } else {
      systemPrompt = kDefaultSystemPrompt
      systemPromptSuffix = kDefaultSystemPromptSuffix
    }
  }

  let toneAndStylePrompt = kToneAndStylePrompt(toneAndStyle)
  let bioPrompt = !isAsk ? kBioPrompt(user.profile?.bio) : '' // do not want Ask Rosebud to depend on bio as evidence
  let memoryPrompt = ''

  if (inExperiment) {
    // Override prompts if in experiment group
    toneAndStylePrompt = Experiment.kToneAndStylePrompt(toneAndStyle)
    bioPrompt = Experiment.kBioPrompt(user.profile?.bio)
  }

  const systemPromptComponents = [
    systemPrompt,
    toneAndStylePrompt,
    bioPrompt,
    systemPromptSuffix,
    kDefaultLanguagePrompt(user),
  ]

  /**
   * Add context from previous conversations if available
   */

  if (memories?.length) {
    const context = memories
      .flatMap((memory) => formatQuestionForVectorDatabase(memory))
      .join('\n')

    memoryPrompt = `The following are previous entries you've had with the user:\n"""\n${context}\n"""\nReference these conversations when appropriate/relevant.`

    systemPromptComponents.push(memoryPrompt)
  }

  /**
   * Build the messages array
   */
  const messages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: systemPromptComponents.join('\n'),
    },
    ...formattedEntries,
  ]

  /**
   * Determine the model to use
   */
  let model = getGPTModelForStream(kFunctionName, user)

  if (counterRefusal || shouldSoftLimit) {
    model = kSpeedGPTModel
  }

  /**
   * Trim the context window if needed
   */
  const trimmedMessages = trimContextWindow(
    messages,
    kMaxContextWindowCharacters[model]
  )

  const request: ChatCompletionCreateParams = {
    model,
    temperature: 0.6,
    stream: true,
    messages: trimmedMessages,
  }

  const stream = await OpenAIStream(request, async (response) => {
    await kv.set(
      user.id + '/' + localDate,
      {
        digDeeper: dailyDigDeepersUsed + 1,
      },
      {
        ex: 60 * 60 * 24, // 24 hours
      }
    )
    await trackOpenAiUsage(
      {
        userId: user.uuid!,
        model,
        stream: request.stream,
        feature: kFunctionName,
        messages,
        response,
      },
      {
        toneTokens: encode(toneAndStylePrompt).length,
        bioTokens: encode(bioPrompt).length,
        memoryTokens: encode(memoryPrompt).length,
        softLimitExceeded: shouldSoftLimit,
        dailyDigDeepersUsed,
      }
    )
  })

  return createStreamedApiReponse(stream, model)
}

export default withStreamMiddleware(handler)
