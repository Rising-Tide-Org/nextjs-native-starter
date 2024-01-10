export const splitNumberedList = (str: string): string[] => {
  // Using regex to match digit-dot-space pattern and replace it with an empty string
  const result = str.replace(/\d+\.\s/g, '#').split('#')

  // Remove the first element
  result.shift()

  return result
}

export const removeTrailingNumber = (str: string): string => {
  // Using regex to match any number or number-dot at the end of the string and replace it with an empty string
  return str?.replace(/\d+\.?$\s?/g, '')
}

export const removeLeadingNumber = (str: string): string => {
  // Using regex to match any number or number-dot at the start of the string and replace it with an empty string
  return str?.replace(/^\d+\.?\s?/g, '').trim()
}

/**
 * Capitalize first letter of a string
 */
export const ucFirst = (str: string): string => {
  // Check if string is not empty, then capitalize first character and concatenate it with rest of the string.
  return str && str[0].toUpperCase() + str.slice(1)
}

export const titleCase = (text: string) => {
  return text.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1)
  })
}

export const stripEmojis = (str: string): string => {
  return str
    .replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2B50}\u{2B55}]/gu,
      ''
    )
    .trim()
}
export const hasEmoji = (str: string): boolean => {
  return str.match(/\p{Emoji}/gu) !== null
}

/**
 * Chunks a string into an array of strings.
 * Uses the period nearest the end of the chunkSize so that partial sentences are not chunked.
 * @param str
 * @param chunkSize
 * @returns
 */
export const chunkStringAtPeriod = (
  str: string,
  chunkSize = 1000
): string[] => {
  if (str.length <= chunkSize) {
    // No need to chunk
    return [str]
  }

  const chunks = []
  let start = 0

  while (start < str.length - 1) {
    const end = Math.min(start + chunkSize, str.length)
    let lastPeriod = str.lastIndexOf('.', end) + 2

    if (lastPeriod <= start || end >= str.length) {
      lastPeriod = end
    }

    chunks.push(str.substring(start, lastPeriod))
    start = lastPeriod
  }

  return chunks
}
