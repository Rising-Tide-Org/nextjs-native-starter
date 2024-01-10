type FormValidationResult = {
  success: boolean
  errors: Record<string, string>
}

export const kEmailMinLength = 6
export const kEmailRegex =
  // eslint-disable-next-line no-useless-escape
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export const kPasswordMinLength = 6
export const kPasswordRegex = /^(?=.*[A-Z])(?=.*\d).+$/

export const validateForm = (
  elements: HTMLInputElement[]
): FormValidationResult => {
  const errors: Record<string, string> = {}
  let success = true

  for (const element of elements) {
    const value = element.value.trim()
    const minLength = element.minLength || 0
    if (element.required && !value) {
      errors[element.name] = 'This field is required'
      success = false
    }
    if (element.type === 'email') {
      if (!kEmailRegex.test(value)) {
        errors[element.name] = 'Invalid email'
        success = false
      }
    }
    if (minLength && value.length < minLength) {
      errors[element.name] = `Must be at least ${element.minLength} characters`
      success = false
    }
    if (element.type === 'password') {
      if (!kPasswordRegex.test(value)) {
        errors[element.name] =
          'At least one uppercase letter and one number. No spaces.'
        success = false
      }
    }
  }

  return { success, errors }
}
