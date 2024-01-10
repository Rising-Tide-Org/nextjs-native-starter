import { fetchNextApi } from 'net/api'

export class PhoneVerificationError extends Error {
  public code: string

  constructor(message: string, code: string) {
    super(message)

    this.code = code
  }
}

export async function verify(
  phoneNumber: string,
  code: string | number
): Promise<boolean> {
  const resp = await fetchNextApi('/api/phone/verify', {
    method: 'POST',
    body: JSON.stringify({ to: phoneNumber, code }),
    headers: {
      Accept: 'application/json',
    },
  })

  if (resp.error) {
    throw new PhoneVerificationError(resp.error?.message, resp.error?.code)
  }

  return true
}

export async function check(phoneNumber: string): Promise<boolean> {
  const resp = await fetchNextApi('/api/phone/check', {
    method: 'POST',
    body: JSON.stringify({ to: phoneNumber }),
    headers: {
      Accept: 'application/json',
    },
  })

  if (resp.error) {
    throw new PhoneVerificationError(resp.error?.message, resp.error?.code)
  }

  return true
}
