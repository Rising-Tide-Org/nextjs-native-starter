/**
 * getServerSideProps helper fn for safely getting url query or params.
 * @param query A ParsedUrlQuery - either ctx.params or ctx.query
 * @param key String key of the param you're after
 */
export const getQueryParam = (query: any, key: string): string | null => {
  if (!query || !key) {
    return null
  }

  const param = query[key]
  if (!param) {
    return null
  }

  if (Array.isArray(param)) {
    return param[0]
  }
  return param
}

export const constructQueryParams = (params: {
  [key: string]: string | number | undefined
}): string => {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, value.toString())
    }
  })

  return searchParams.toString()
}

/**
 * Conveniently add a param to the existing URL or one provided.
 * @returns "?existingParam=one&newParam=two"
 */
export const appendQueryParam = (name: string, value: string, url?: string) => {
  const currentUrl = new URL(url ?? location.href)
  const params = new URLSearchParams(currentUrl.search)
  params.append(name, value)
  return `?${params.toString()}`
}
