/**
 * Extracts UTM parameters from the provided window's location search string.
 * This function is intended to be run on the client side only.
 *
 * @returns {Record<string, string>} A key-value map of UTM parameters.
 */
export const getUTMParams = (): Record<string, string> => {
  // Return an empty object if not in a browser environment
  if (typeof window === 'undefined') {
    console.warn('getUTMParams should only be called from the client-side.')
    return {}
  }

  const { location } = window
  const utmParams: Record<string, string> = {}

  if (location?.search?.includes('utm')) {
    const queryParams = location.search.substring(1) // Remove the leading '?'
    const utmPairs = queryParams
      .split('&')
      .filter((param) => param.startsWith('utm_'))
      .map((param) => param.split('='))

    Object.assign(utmParams, Object.fromEntries(utmPairs))
  }

  return utmParams
}
