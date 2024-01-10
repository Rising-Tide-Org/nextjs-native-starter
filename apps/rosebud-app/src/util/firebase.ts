import { kCollectionPathMap } from 'constants/firebase'
import { FirebaseError } from 'firebase/app'
import { getUserFromToken } from 'middleware/shared'
import { NextPageContext } from 'next'
import { CollectionPath } from 'types/Firebase'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as cookie from 'cookie'

// By default firebase returns us quite ambiguous error codes and technical messages with a lot of firebase branding,
// so we want to parse it to user friendly format
export const parseFirebaseError = (error: FirebaseError) => {
  if (typeof error === 'object' && error !== null) {
    const { code, message } = error

    let parsedMessage = message
    switch (code) {
      case 'auth/email-already-in-use':
        parsedMessage = 'This email address is already in use.'
        break
      case 'auth/invalid-email':
        parsedMessage = 'This email address is not valid.'
        break
      case 'auth/operation-not-allowed':
        parsedMessage = 'This authentication method is not allowed.'
        break
      case 'auth/weak-password':
        parsedMessage = 'Your password is not strong enough.'
        break
      case 'auth/user-disabled':
        parsedMessage =
          'The account corresponding to the given email has been disabled.'
        break
      case 'auth/user-not-found':
        parsedMessage = 'A user for this email address doesn’t exist.'
        break
      case 'auth/wrong-password':
        parsedMessage = 'Email address or password is incorrect.'
        break
      case 'auth/missing-email':
        parsedMessage = 'A valid email is required.'
        break
      case 'auth/argument-error':
        parsedMessage = 'There was an issue signing your in. Please try again.'
        break
      case 'auth/invalid-action-code':
        parsedMessage = 'This link is either invalid or has already been used.'
        break
      case 'auth/requires-recent-login':
        parsedMessage = 'Re-authenticate to perform this action.'
        break
      case 'auth/too-many-requests':
        parsedMessage = 'Too many attempts, wait and try again.'
        break
    }

    return parsedMessage
  }
  return 'Unknown error.'
}

/**
 * Construct a collection path by replacing the {userId} placeholder with the actual user ID
 */
export const getCollectionPath = (
  path: CollectionPath,
  userId?: string
): string => {
  return userId
    ? kCollectionPathMap[path].replace('{userId}', userId)
    : kCollectionPathMap[path]
}

export const getUserIdFromContext = async (context: NextPageContext) => {
  const parsedCookies = cookie.parse(context.req?.headers.cookie ?? '')
  const token = parsedCookies['token']

  if (token) {
    const userId = (await getUserFromToken(token))?.uid
    return userId
  }

  return undefined
}
