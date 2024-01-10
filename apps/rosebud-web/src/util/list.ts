export const shuffleArray = <T>(arr: T[]): T[] => {
  const originalArray = [...arr]
  const randomizedArray: T[] = []

  while (originalArray.length > 0) {
    const randomIndex = Math.floor(Math.random() * originalArray.length)
    randomizedArray.push(...originalArray.splice(randomIndex, 1))
  }
  return randomizedArray
}
