/**
 * Parses a partial JSON string for use with streaming API responses
 * @param jsonStr
 * @returns Parsed JSON, or empty obeject until first key/value is encountered
 */

class PartialJSONParser {
  private lastIndex = 0
  private stack: string[] = []
  private quoteOpen = false
  private commaEncountered = false

  parse(jsonStr: string): Record<string, any> | Record<string, any>[] {
    for (let i = this.lastIndex; i < jsonStr.length; i++) {
      const char = jsonStr[i]

      if (char === '"' && jsonStr[i - 1] !== '\\') {
        this.quoteOpen = !this.quoteOpen
      }

      if (!this.quoteOpen) {
        if (char === '{' || char === '[') {
          this.stack.push(char)
          this.commaEncountered = false
        } else if (char === '}' && this.stack[this.stack.length - 1] === '{') {
          this.stack.pop()
        } else if (char === ']' && this.stack[this.stack.length - 1] === '[') {
          this.stack.pop()
          this.commaEncountered = false
        } else if (char === ':') {
          this.commaEncountered = false
        } else if (char === ',') {
          this.commaEncountered = true
        }
      }
    }

    // Update the index so we know where to start parsing from next time
    this.lastIndex = jsonStr.length

    /**
     *
     * Everything below this point makes incomplete JSON valid.
     *
     * For example, if the last character is a comma, or if there is
     * an incomplete object, or if there are missing closing brackets.
     *
     */

    jsonStr = jsonStr.trim()

    if (this.quoteOpen) {
      jsonStr += '"'
    }

    const inArray = this.stack[this.stack.length - 1] === '['

    if ((this.commaEncountered && !inArray) || jsonStr.endsWith(':')) {
      const lastCommaIndex = jsonStr.lastIndexOf(',')
      if (lastCommaIndex !== -1) {
        jsonStr = jsonStr.substring(0, lastCommaIndex)
      }
    }

    if (jsonStr.endsWith(',')) {
      jsonStr = jsonStr.substring(0, jsonStr.length - 1)
    }

    // Add necessary closing brackets based on the current state of the stack
    for (let i = this.stack.length - 1; i >= 0; i--) {
      if (this.stack[i] === '{') {
        jsonStr += '}'
      } else if (this.stack[i] === '[') {
        jsonStr += ']'
      }
    }

    try {
      return JSON.parse(jsonStr)
    } catch (e) {
      return {}
    }
  }
}

export default PartialJSONParser
