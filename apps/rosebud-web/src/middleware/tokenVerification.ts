import type { Middleware } from 'next-api-middleware'
import { NextApiRequest } from 'next'
import { fetchOne } from 'db-server/fetch'
import { User } from 'types/User'
import { initializeAdmin } from 'db-server'
import { getUserFromToken } from './shared'

/**
 * This is a custom type that extends NextApiResponse to include a _user property
 * that is fetched from the database
 */
export type NextAuthApiRequest = NextApiRequest & {
  _user?: User
}

export const getDbUserWithId = async (uid: string) => {
  const app = await initializeAdmin()
  const db = await app.firestore()

  const { data: user } = await fetchOne<User>(db, 'users', uid)

  return user
}

const tokenVerification: Middleware = async (
  req: NextAuthApiRequest,
  res,
  next
) => {
  const token = req.cookies['token']

  console.log('==============================')
  console.log('api req w token?', token)
  console.log('==============================')

  const userId = (await getUserFromToken(token))?.uid

  if (!userId) {
    return res.status(401).json({ errors: ['Access denied.'] })
  }

  const user = await getDbUserWithId(userId)

  if (!user) {
    return res.status(401).json({ errors: ['Access denied.'] })
  }

  req._user = user

  return next()
}

export default tokenVerification
