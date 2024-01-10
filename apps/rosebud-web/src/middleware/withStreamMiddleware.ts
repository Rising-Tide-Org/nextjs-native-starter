import { captureException } from '@sentry/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from './shared'
import FireStoreParser from 'firestore-parser'
import { User } from 'types/User'
import { Entry } from 'types/Entry'
import { firestoreUrl, kDatabaseName, kProjectName } from 'constants/firebase'

/**
 * This is a custom response type that extends NextResponse
 * to include a _user object that is fetched from the database
 */
export type NextAuthRequest = NextRequest & {
  _user?: User
}

type HandlerType = (
  req: NextAuthRequest,
  res: NextResponse
) => Promise<Response>

// NOTE:
// Specifically created to use with edge runtime steaming type endpoints
// by default streaming endpoints are authenticated and method agnostic
const withStreamMiddleware =
  (handler: HandlerType) =>
  async (req: NextAuthRequest, res: NextResponse): Promise<Response> => {
    try {
      const token = req.cookies.get('token')?.value
      const userIdentity = await getUserFromToken(token)

      if (!userIdentity?.uid) {
        return NextResponse.json({ error: 'Access denied' }, { status: 401 })
      }

      req._user = await getDbUser(userIdentity.uid, token)

      return handler(req, res)
    } catch (error) {
      captureException(error)
      return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
  }

const getDbUser = async (uid: string, accessToken?: string) => {
  if (!accessToken) return
  try {
    const response = await fetch(
      `${firestoreUrl}/v1/projects/${kProjectName}/databases/${kDatabaseName}/documents/users/${uid}`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    const json = await response.json()

    const parsedUserObject = FireStoreParser(json)?.fields as User
    return parsedUserObject
  } catch (e) {
    console.error('Error', e)
  }
}

/**
 * Returns all entries with provided entry ids
 */
export const getDbEntries = async (
  uid: string,
  accessToken: string,
  entryIds: string[]
) => {
  if (!accessToken) return
  try {
    const body = {
      structuredQuery: {
        from: [
          {
            collectionId: 'entries',
          },
        ],
        where: {
          fieldFilter: {
            field: {
              fieldPath: 'id',
            },
            op: 'IN',
            value: {
              arrayValue: {
                values: entryIds.map((id) => ({ stringValue: id })),
              },
            },
          },
        },
      },
    }

    const response = await fetch(
      `${firestoreUrl}/v1/projects/${kProjectName}/databases/${kDatabaseName}/documents/users/${uid}:runQuery`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      }
    )
    const json = await response.json()

    const parsedEntriesObject = FireStoreParser(json) as [
      { document: { fields: Entry } }
    ]
    const entries = parsedEntriesObject
      .filter((obj) => obj.document?.fields)
      .map((obj) => obj.document.fields)
    return entries
  } catch (e) {
    console.error('Error', e)
  }
}

export default withStreamMiddleware
