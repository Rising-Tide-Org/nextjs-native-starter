import { getFirebaseAuth } from 'next-firebase-auth-edge/lib/auth'
import { firebaseConfig } from 'constants/firebase'
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier'
import { captureException } from '@sentry/nextjs'

/**
 * In this file are shared methods for endpoints that are used by both edge and non edge servers
 * This should not have anything that edge does not like
 */

export const getUserFromToken = async (token?: string) => {
  let userIdentity: DecodedIdToken | null = null

  if (!token) return userIdentity

  const { verifyIdToken } = getFirebaseAuth(
    {
      projectId: firebaseConfig.server.projectId!,
      privateKey: firebaseConfig.server.privateKey!.replace(/\\n/g, '\n'),
      clientEmail: firebaseConfig.server.clientEmail!,
    },
    firebaseConfig.client.apiKey!
  )

  try {
    userIdentity = await verifyIdToken(token, true)
  } catch (error) {
    captureException(error)
  }

  return userIdentity
}
