export const getRandomElement = <T>(arr: T[], weights?: number[]): T => {
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error('Invalid or empty array')
  }

  if (weights && arr.length !== weights.length) {
    throw new Error('The length of array and weights must be the same')
  }

  if (!weights) {
    const randomIndex = Math.floor(Math.random() * arr.length)
    return arr[randomIndex]
  }

  let totalWeight = 0
  for (const weight of weights) {
    totalWeight += weight
  }

  const randomNum = Math.random() * totalWeight
  let weightSum = 0

  for (let i = 0; i < arr.length; i++) {
    weightSum += weights[i]
    weightSum = Number(weightSum.toFixed(2)) // Fix floating-point issues, if any

    if (randomNum < weightSum) {
      return arr[i]
    }
  }

  return arr[0] // Shouldn't get here, but added as a fallback
}

export const splitArrayIntoChunks = <T>(
  array: T[],
  chunkSize: number
): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }
  return chunks
}
