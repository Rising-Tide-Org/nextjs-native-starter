import { kSupportStyleMap } from 'constants/personalization'
import { ComposeResponse } from 'types/Compose'
import { stripEmojis } from './string'

export const generateBioAndToneFromOnboarding = (
  responses: ComposeResponse[]
): { bio: string; toneAndStyle: string } => {
  const extractResponse = (id: string) => {
    const response = responses.find((r) => r.id === id)?.response[0]
    return stripEmojis(response ?? '').trim()
  }

  const goal = extractResponse('goal')
  const age = extractResponse('age')
  const identity = extractResponse('identity')
  const occupation = extractResponse('occupation')
  const relationship = extractResponse('relationship')
  const spirituality = extractResponse('spirituality')
  const style = responses.find((r) => r.id === 'support-style')?.response

  let bio = `I'm ${age},`
  if (identity !== 'Prefer not to say') {
    bio += ` ${identity},`
  }
  bio += ` ${occupation}, and ${relationship}.`
  if (spirituality !== 'Prefer not to say') {
    bio += ` I am ${spirituality}.`
  }
  if (!goal.includes('curious')) {
    bio += ` My goal is ${goal.toLowerCase()}.`
  }

  const toneAndStyle = style?.map((r) => kSupportStyleMap[r]).join(' ') ?? ''

  return { bio, toneAndStyle }
}
