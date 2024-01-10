/**
 * A method to get the stack trace of an error, basically console.trace but in a string
 * @returns string
 */
export const getStackTrace = () => {
  let stack

  try {
    throw new Error('')
  } catch (error) {
    stack = error.stack || ''
  }

  stack = stack.split('\n').map(function (line: string) {
    return line.trim()
  })
  // eslint-disable-next-line eqeqeq
  return stack.splice(stack[0] == 'Error' ? 2 : 1)
}
