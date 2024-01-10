import {
  kFreeDigDeeperLimitPerEntry,
  kPremiumDigDeeperLimitPerEntry,
} from 'constants/limits'
import { fetchOne } from 'db/fetch'
import { passThru } from 'net/openai'
import { ChatCompletionMessageParam } from 'openai/resources'
import generateAskTemplate from 'templates/ask'
import morningIntentionTemplate from 'templates/morning-intention'
import roseBudThornTemplate from 'templates/rose-bud-thorn'
import roseThornTemplate from 'templates/rose-thorn'
import { AskItem } from 'types/Ask'
import { CollectionItem } from 'types/Collection'
import {
  ComposePrompt,
  ComposeResponse,
  ComposeTemplate,
  ComposeTemplatePrompt,
} from 'types/Compose'
import { Prompt } from 'types/Prompt'
import { isMorning } from 'util/date'

export namespace Template {
  /**
   * Fetches the right template based on the id
   * @param templateId
   * @returns
   */
  export const fetch = async (
    templateId: string | undefined
  ): Promise<ComposeTemplate> => {
    // If there is no template id, return the blank template
    if (!templateId) {
      return {
        id: 'blank',
        name: 'New entry',
        finishMode: 'always',
        prompts: [
          {
            id: 'blank',
            input: 'text',
            contentType: 'static',
            content: ["What's on your mind?"],
          },
        ],
      }
    }
    // Any template prefixed with `prompt` is a personal prompt we fetch from the db
    else if (templateId.startsWith('prompt')) {
      const promptId = templateId.split('-')[1]
      const legacyPrompt = await fetchOne<Prompt>('prompts', promptId)

      if (legacyPrompt) {
        const prompt: ComposeTemplatePrompt = {
          id: `prompt-${legacyPrompt.id}`,
          input: 'text',
          contentType: 'static',
          content: [legacyPrompt.question],
        }

        return {
          id: templateId,
          analyticsId: 'custom',
          name: 'Reflect',
          prompts: [prompt],
          metadata: {
            isBookmarked: legacyPrompt.isBookmarked,
          },
        }
      } else {
        const itemPrompt = await fetchOne<CollectionItem>('items', promptId)

        if (itemPrompt) {
          const prompt: ComposeTemplatePrompt = {
            id: `prompt-${itemPrompt.id}`,
            input: 'text',
            contentType: 'static',
            content: [itemPrompt.content ?? ''],
          }

          return {
            id: templateId,
            analyticsId: 'custom',
            name: 'Reflect',
            prompts: [prompt],
          }
        }

        throw new Error('Personal prompt not found')
      }
    } else if (Template.isAsk(templateId)) {
      const askId = templateId.split('-')[1]
      const dbAsk = await fetchOne<AskItem>('items', askId)

      if (dbAsk) {
        return generateAskTemplate(dbAsk)
      } else {
        throw new Error('Ask question not found')
      }
    } else {
      // Otherwise, we fetch from the static templates, dyanmically loaded
      let template: ComposeTemplate
      try {
        template = (await import(`templates/${templateId}`)).default
      } catch (e) {
        console.error(e)
        throw new Error('Template file missing')
      }
      if (template) {
        return template
      }
    }
    throw new Error('Template not found')
  }

  /**
   * Fetch a particular response from a list of responses
   */
  export const response = (
    promptId: string,
    responses: ComposeResponse[]
  ): string[] | undefined => responses.find((r) => r.id === promptId)?.response

  /**
   * Fetch a particular prompt from a list of responses
   */
  export const prompt = (
    promptId: string,
    responses: ComposeResponse[]
  ): ComposePrompt | undefined =>
    responses.find((r) => r.id === promptId)?.prompt

  /**
   * Get the next prompt in the template based after a prompt id
   */
  export const promptAfterPromptId = (
    template: ComposeTemplate,
    promptId: string | undefined,
    responses: ComposeResponse[]
  ): ComposeTemplatePrompt | undefined => {
    const promptIndex = template.prompts.findIndex((p) => p.id === promptId)

    if (promptIndex === -1) {
      return
    }

    let nextPromptIndex = promptIndex + 1

    // Find the next prompt that's shown
    while (nextPromptIndex < template.prompts.length) {
      const nextPrompt = template.prompts[nextPromptIndex]
      if (!nextPrompt.isShown || nextPrompt.isShown(responses)) {
        return nextPrompt
      }
      nextPromptIndex++
    }

    return
  }

  /**
   * Derive final shape of a question
   */
  export const derivePrompt = async (
    templatePrompt: ComposeTemplatePrompt,
    responses: ComposeResponse[]
  ): Promise<ComposePrompt> => {
    const derivedPrompt: ComposePrompt = {
      id: templatePrompt.id,
      input: templatePrompt.input,
      contentType: templatePrompt.contentType,
      shouldShuffleOptions: templatePrompt.shouldShuffleOptions,
      isRequired: templatePrompt.isRequired,
      buttonLabel: templatePrompt.buttonLabel,
      noneOption: templatePrompt.noneOption,
      showOtherOption: templatePrompt.showOtherOption,
      maxSelections: templatePrompt.maxSelections,
      placeholder: templatePrompt.placeholder,
      content: [],
      options: [],
    }

    try {
      /**
       * Dynamic vs. static content
       */
      if (typeof templatePrompt.content === 'function') {
        if (templatePrompt.contentType === 'ai') {
          const { response } = await passThru(
            templatePrompt.content(responses) as ChatCompletionMessageParam[]
          )
          derivedPrompt.content = [response ?? '']
        } else {
          derivedPrompt.content = templatePrompt.content(responses) as string[]
        }
      } else {
        derivedPrompt.content = templatePrompt.content as string[]
      }

      /**
       * Dynamic vs. static options
       */
      if (typeof templatePrompt.options === 'function') {
        derivedPrompt.options = templatePrompt.options(responses)
      } else {
        derivedPrompt.options = templatePrompt.options
      }

      /**
       * Dynamic vs. static visibility
       */
      if (typeof templatePrompt.isShown === 'function') {
        derivedPrompt.isShown = templatePrompt.isShown(responses)
      } else {
        derivedPrompt.isShown = templatePrompt.isShown
      }
    } catch (e) {
      console.error('Error deriving question', e)
    }
    return derivedPrompt
  }

  /**
   * Creates a static prompt given a string or array of strings
   * Synthesizes an id from the prompt
   * @param prompt A string or array of strings, ends up as an array of strings
   * @returns A ComposePrompt
   */

  export const createStaticPrompt = (
    prompt: string | string[]
  ): ComposePrompt => {
    prompt = Array.isArray(prompt) ? prompt : [prompt]
    return {
      id: prompt.join('').slice(0, 32).toLowerCase().replace(/\s/g, '-'),
      content: prompt,
      input: 'text',
      contentType: 'static',
    }
  }

  /**
   * Creates a ComposeResponse object given a prompt
   * @param prompt A ComposePrompt
   * @param response A ComposeResponse, empty by default
   * @returns A ComposeResponse
   */

  export const createResponseForPrompt = (
    prompt: ComposePrompt,
    response: string[] = []
  ): ComposeResponse => {
    return {
      id: prompt.id,
      prompt,
      response,
    }
  }

  /**
   * Gets the time-sensitive context for the check-in
   * @params onboarding Whether or not this is an onboarding check-in
   * @returns Template for the current time of day
   */
  export const getTemplateForCheckIn = (
    onboarding = false
  ): ComposeTemplate => {
    // If it's morning, use the morning intention template, otherwise use the rose template
    // If it's onboarding, use an abbreviated rose template
    const roseTemplate = onboarding ? roseThornTemplate : roseBudThornTemplate
    return isMorning() ? morningIntentionTemplate : roseTemplate
  }

  /**
   * Determines if the user can dig deeper based on subscription status and template
   */
  export const canDigDeeper = (
    isSubscriptionActive: boolean,
    composeTemplate: Pick<
      ComposeTemplate,
      'finishMode' | 'estimatedPromptCount' | 'prompts'
    >,
    numResponses: number
  ): boolean => {
    // We count dig deepers from beyond the template prompt count
    // For auto-finish templates, we limit to the estimated prompt count
    const numPrompts =
      composeTemplate.estimatedPromptCount ?? composeTemplate.prompts.length

    // If the template is auto-finish, we limit to the estimated prompt count
    const promptLimit =
      composeTemplate.finishMode === 'auto'
        ? composeTemplate.estimatedPromptCount
        : 0

    const digDeeperLimit = isSubscriptionActive
      ? kPremiumDigDeeperLimitPerEntry
      : Math.max(promptLimit ?? 0, kFreeDigDeeperLimitPerEntry)

    // "Dig deepers" are only counted from the point after the last template prompt (numPrompts)
    const digDeepersRemaining = digDeeperLimit + numPrompts - numResponses - 1

    return digDeepersRemaining > 0
  }

  /**
   * Determines if template is Ask Rosebud template
   */
  export const isAsk = (templateId?: string): boolean =>
    (templateId ?? '').startsWith('ask-')
}
