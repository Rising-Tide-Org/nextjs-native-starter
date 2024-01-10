export const convertVersionToInt = function (version?: string) {
  if (!version) return null

  // Split a given version string into three parts.
  const parts = version.split('.').map((part) => parseInt(part, 10))
  // Check if we got exactly three parts, otherwise throw an error.
  if (parts.length !== 3) {
    throw new Error('Received invalid version string')
  }

  const major = parts[0]
  const minor = parts[1]
  const patch = parts[2]

  if (minor >= 1000) {
    throw new Error('Minor version can not be bigger than 999')
  }
  if (patch >= 100) {
    throw new Error('Patch version can not be bigger than 99')
  }
  // Let's create a new number which we will return later on
  let numericVersion = 0
  // Shift all parts either 0, 10 or 20 bits to the left.
  numericVersion += major * 100_000
  numericVersion += minor * 100
  numericVersion += patch
  return numericVersion
}
