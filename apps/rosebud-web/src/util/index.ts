/**
 * Accepts a scalar input and returns if it is truthy.
 * @param any
 * @param defaultValue
 * @returns
 */
export const isTruthy = (
  anyValue?: string | boolean | number | null | bigint,
  defaultValue = false
): boolean => {
  switch (typeof anyValue) {
    case 'undefined':
      return defaultValue
    case 'boolean':
      return anyValue === true
    case 'number':
      return anyValue !== 0
    case 'bigint':
      return anyValue !== 0n
    case 'string':
      return anyValue !== 'false' && anyValue !== '0'
    default:
      break
  }
  return defaultValue
}
