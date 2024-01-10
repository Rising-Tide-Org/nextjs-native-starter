import { UUID } from 'uuidjs'

export const uuidv4 = () => {
  return UUID.genV4().hexString
}

export const generateRandomString = (length: number) => {
  const charset =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return result
}
