import { NextApiRequest, NextApiResponse } from 'next'
import { fetchGroup } from 'db-server/fetch'
import { generateRandomString } from 'util/uuid'
import { Referral } from 'types/Referral'
import { initializeAdmin } from 'db-server'
import withMiddleware from 'middleware'

const generateCodeValue = () => {
  const code = generateRandomString(5)
  return code.toUpperCase()
}

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const app = await initializeAdmin()
    const db = await app.firestore()

    const generateUniqueCode = async (): Promise<string> => {
      const code = generateCodeValue()

      const { data: referralData } = await fetchGroup<Referral>(
        db,
        'referrals',
        async (query) => query.where('code', '==', code)
      )

      const isCodeUnique = !(referralData.length > 0)
      return isCodeUnique ? code : generateUniqueCode()
    }

    const code = await generateUniqueCode()
    res.status(200).json({
      response: {
        referralCode: code,
      },
    })
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json({ error: { statusCode: 500, message: error.message } })
  }
}

export default withMiddleware({
  authenticated: true,
})(handler)
