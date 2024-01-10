import { User } from 'types/User'

/**
 * Generates a query string for the satisfaction survey typeform URL
 */

export const makeTypeformQueryString = (
  user: User,
  subscriber: boolean
): string => {
  const values: Record<string, string> = {
    uuid: user.uuid ?? '',
    email: user.email ?? '',
    subscriber: subscriber ? 'true' : 'false',
    age: user.onboarding?.age as string,
    identity: user.onboarding?.identity as string,
    grief: findUserOnboardingValue('struggles', user, 'grief'),
    anxiety: findUserOnboardingValue('struggles', user, 'anxiety'),
    depression: findUserOnboardingValue('struggles', user, 'depression'),
    loneliness: findUserOnboardingValue('struggles', user, 'loneliness'),
    anger: findUserOnboardingValue('struggles', user, 'anger'),
    adhd: findUserOnboardingValue('struggles', user, 'adhd'),
    sleep: findUserOnboardingValue('struggles', user, 'sleep'),
    career: findUserOnboardingValue('goal', user, 'career'),
    relationships: findUserOnboardingValue('goal', user, 'relationships'),
    health: findUserOnboardingValue('goal', user, 'health'),
    hobbies: findUserOnboardingValue('goal', user, 'hobbies'),
    growth: findUserOnboardingValue('goal', user, 'growth'),
  }

  const queryString = Object.keys(values)
    .filter((key) => values[key] && values[key] !== '')
    .map((key) => `${key}=${values[key]}`)

  return queryString.join('&')
}

/**
 * Helper function to find a value in the user's onboarding object
 */

const findUserOnboardingValue = (
  type: 'goal' | 'struggles',
  user: User,
  key: string
) => {
  const regex = new RegExp(key, 'i')
  if (Array.isArray(user.onboarding?.[type])) {
    const value = (user.onboarding?.[type] as Array<string>)?.find((item) =>
      item.match(regex)
    )
    return value ? 'true' : ''
  } else {
    return (user.onboarding?.[type] as string)?.match(regex) ? 'true' : ''
  }
}
