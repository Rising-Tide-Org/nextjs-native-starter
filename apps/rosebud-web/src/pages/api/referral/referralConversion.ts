import { NextApiRequest, NextApiResponse } from 'next'
import { initializeAdmin } from 'db-server'
import { ReferralConversionStage } from 'constants/referral'
import { User } from 'types/User'
import { fetchGroup, fetchOne } from 'db-server/fetch'
import { Referral } from 'types/Referral'
import withMiddleware from 'middleware'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const app = await initializeAdmin()
    const db = await app.firestore()
    const parsedBody = JSON.parse(req.body)

    const stage = parsedBody?.stage as ReferralConversionStage
    const uid = parsedBody?.uid as string
    const referredByCode = parsedBody?.referralCode as string | undefined

    // Validate the input data
    if (!uid) {
      throw new Error('uid is required')
    }

    if (!referredByCode && stage === ReferralConversionStage.initial) {
      throw new Error('If stage is initial then referredByCode is required')
    }

    // Retrieve the user and check if exists
    const { data: userData, ref } = await fetchOne<Partial<User>>(
      db,
      'users',
      uid
    )

    // When user is created
    if (stage === ReferralConversionStage.initial) {
      if (!userData?.referredByCode) {
        // Set referredByCode on current user, make sure to merge it with existing data
        await ref?.set({ referredByCode }, { merge: true })
      }
      return res.status(200).json({ success: true })
    }

    // When user creates an account for themselves
    if (stage === ReferralConversionStage.signup) {
      if (userData?.referredByCode) {
        const { docs: referralDocs } = await fetchGroup<Referral>(
          db,
          'referrals',
          async (query) => query.where('code', '==', userData.referredByCode)
        )

        referralDocs.forEach(async (doc) => {
          const referrerSnap = doc.data()
          // Remove duplicates and add current user uid to referrer signups
          const updatedSignupsSet = new Set([...referrerSnap.signups, uid])
          const updatedSignups = Array.from(updatedSignupsSet)
          if (referrerSnap.code === userData.referredByCode) {
            await doc.ref.set({ signups: updatedSignups }, { merge: true })
          }
        })
      }

      return res.status(200).json({ success: true })
    }

    // When user starts a subscription trial
    if (stage === ReferralConversionStage.trial) {
      if (userData?.referredByCode) {
        const { docs: referralDocs } = await fetchGroup<Referral>(
          db,
          'referrals',
          async (query) => query.where('code', '==', userData.referredByCode)
        )

        referralDocs.forEach(async (doc) => {
          const referrerSnap = doc.data()
          // Remove duplicates and add current user uid to referrer 	trials
          const updatedTrialsSet = new Set([...referrerSnap.trials, uid])
          const updatedTrials = Array.from(updatedTrialsSet)
          if (referrerSnap.code === userData.referredByCode) {
            doc.ref.set({ trials: updatedTrials }, { merge: true })
          }
        })
      }

      return res.status(200).json({ success: true })
    }

    // If none of the stages match return an error
    return res.status(500).json({
      error: {
        statusCode: 500,
        message: 'A valid conversion stage must be defined',
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
  methods: ['POST'],
  authenticated: true,
})(handler)
