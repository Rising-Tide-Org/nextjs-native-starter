export const isLocal = () => process.env.NODE_ENV === 'development'

export const isServer = () => typeof window === 'undefined'

export const isClient = () => typeof window !== 'undefined'

export const isDev = () =>
  process.env.NODE_ENV === 'development' ||
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'development'

export const isPreview = () => process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'

export const isProd = () =>
  [process.env.NEXT_PUBLIC_VERCEL_ENV, process.env.APP_ENV].includes(
    'production',
  )

export const kPublicUrl = isDev()
  ? `http://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`

export const kDeploymentUrl = () => {
  if (isDev()) {
    return 'http://192.168.0.146:3000'
    // return 'http://localhost:3000'
  }

  if (isProd()) {
    return 'https://my.rosebud.app'
  }

  // This is set to 'rosebud'
  const projectName = process.env.NEXT_PUBLIC_VERCEL_PROJECT_NAME

  // This is provided by Vercel, set to the name of the Git branch
  const gitRef = process.env.VERCEL_GIT_COMMIT_REF

  // This is set to 'just-imagine'
  const scopeSlug = process.env.NEXT_PUBLIC_VERCEL_SCOPE_SLUG

  // This returns the branch URL for preview deployments
  // This is needed for deeplinking to compose flow from notifications
  return `https://${projectName}-git-${gitRef}-${scopeSlug}.vercel.app`
}

export const getApiUrl = (headers: Headers) =>
  `${isDev() ? 'http' : 'https'}://${headers.get('host')}`
