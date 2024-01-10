import { initializeAdmin } from 'db-server'
import { NextApiRequest, NextPageContext } from 'next'
import nookies from 'nookies'

type AcceptableNextRequest =
  | NextPageContext
  | {
      req: NextPageContext['req']
    }
  | {
      req: NextApiRequest
    }

export const getFirebaseToken = (context: AcceptableNextRequest) => {
  return nookies.get(context)?.token
}

/**
 * Get firebase user from token stored in cookie
 */
export const getFirebaseUserFromToken = async (cookieToken: string) => {
  const firebaseAdmin = await initializeAdmin()
  try {
    const token = await firebaseAdmin.auth().verifyIdToken(cookieToken, true)
    if (!token) return null
    const user = await firebaseAdmin.auth().getUser(token?.uid)
    return user
  } catch (err) {
    console.error('[Error retrieving user]', err)
  }
  return null
}
