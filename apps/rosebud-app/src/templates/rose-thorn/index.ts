import { ComposeTemplate } from 'types/Compose'
import { kRoseBudThornQuestions } from '../rose-bud-thorn'

/**
 * This is an abbreviated version of the rose-bud-thorn template, with only the
 * rose and thorn prompts. For use in onboarding.
 */
const roseThornTemplate: ComposeTemplate = {
  id: 'rose-thorn',
  saveId: 'rose-bud-thorn',
  name: 'Daily check-in',
  shouldShowProgress: true,
  prompts: [
    {
      id: 'rose',
      input: 'text',
      contentType: 'static',
      content: [
        kRoseBudThornQuestions.rose[
          Math.floor(Math.random() * kRoseBudThornQuestions.rose.length)
        ],
      ],
    },
    {
      id: 'thorn',
      input: 'text',
      contentType: 'static',
      content: [
        kRoseBudThornQuestions.thorn[
          Math.floor(Math.random() * kRoseBudThornQuestions.thorn.length)
        ],
      ],
    },
  ],
}

export default roseThornTemplate
