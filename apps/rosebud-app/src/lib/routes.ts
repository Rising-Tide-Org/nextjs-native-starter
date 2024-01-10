import { constructQueryParams } from 'util/url'

/**
 * An app-wide navigation helper. This doesn't declare routes,
 * rather it just puts all the file system-based route strings
 * in one place.
 */
const routes = {
  default: '/',

  prompt: '/prompt',
  journal: '/journal',
  library: '/library',
  review: '/review',
  onboarding: '/onboarding-new',
  home: '/home',
  subscription: '/subscription',
  subscriptionCancel: '/subscription/cancel',
  settings: '/settings',
  insights: '/insights',

  signin: '/signin',
  signup: '/signup',
  signout: '/signout',
  passwordReset: '/password-reset',

  dynamicPromptTab: (id: string | number) => `/prompts?tab=${id}`,

  compose: (returnTo?: string) =>
    '/compose' + (returnTo ? `?returnTo=${returnTo}` : ''),
  composePrompt: (id: string | number, returnTo?: string) =>
    `/compose/prompt-${id}` + (returnTo ? `?returnTo=${returnTo}` : ''),
  composeAsk: (
    id: string | number,
    params: {
      before?: number
      after?: number
      returnTo?: string
    }
  ) => {
    const queryParams = constructQueryParams(params)
    return `/compose/ask-${id}/` + (queryParams ? `?${queryParams}` : '')
  },
  composeTemplate: (id: string, returnTo?: string) =>
    `/compose/${id}` + (returnTo ? `?returnTo=${returnTo}` : ''),
  composeSummary: (id: string, returnTo?: string) =>
    `/summary/${id}` + (returnTo ? `?returnTo=${returnTo}` : ''),

  entry: (id: string) => `/journal/${id}`,
  entryWeek: (week: string) => `/journal/week/${week}`,
  welcomeFlow: (id: string) => `/welcome/${id}`,
  notFound: '/404',
}

export const unprotectedRoutes = [
  routes.default,
  routes.signin,
  routes.signup,
  routes.passwordReset,
  routes.notFound,
  routes.welcomeFlow('new-year-2024'),
]

export const getBaseUrl = () =>
  `${window.location.protocol}//${window.location.hostname}` +
  (window.location.port ? `:${window.location.port}` : '')

export default routes
