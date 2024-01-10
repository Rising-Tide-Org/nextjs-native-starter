import { NextApiResponse } from 'next'
import { captureException as sentryCaptureException } from '@sentry/nextjs'
import { oneSignalClient } from 'lib/onesignal'
import withMiddleware from 'middleware'
import { NextAuthApiRequest } from 'middleware/tokenVerification'
import { User } from 'types/User'
import { NotificationDeviceType } from 'types/Notification'
import { updateRecord } from 'db-server/mutate'
import { initializeAdmin } from 'db-server'
import { firestore } from 'firebase-admin'

/**
 * unregister-device
 * ---------------------
 * This endpoint is responsible for unregistering a device from OneSignal.
 * It is called from the client-side when the user disables notifications.
 *
 * When unregistering an SMS device, it deletes the player entirely.
 * When unregistering a push device, it marks the player as unsubscribed.
 */

type RequestBody = {
  deviceType: NotificationDeviceType
  deviceId: string
}

const db = await (await initializeAdmin()).firestore()

const handler = async (req: NextAuthApiRequest, res: NextApiResponse) => {
  try {
    const user = req._user!
    const { deviceType, deviceId } = JSON.parse(req.body) as RequestBody

    if (deviceType === 'sms') {
      if (!user.onesignal_id) {
        return res.status(200).json({})
      }
      // Delete the player so they don't get any more SMS messages.
      // It will be recreated if they re-enable SMS notifications
      const response = await oneSignalClient.deletePlayer(
        process.env.ONE_SIGNAL_APP_ID!,
        user.onesignal_id
      )
      if (response.success) {
        await updateRecord<User>(db, 'users', user.id!, {
          userId: user.id!,
          data: {
            onesignal_id: firestore.FieldValue.delete(),
          },
        })
      }
    }

    if (deviceType === 'push') {
      // Mark the player as unsubscribed
      // Cast to any because the device_type should not be required
      await oneSignalClient.updatePlayer(deviceId, {
        notification_types: -2,
      } as any)

      // Update the user's list of devices
      await updateRecord<User>(db, 'users', user.id!, {
        userId: user.id!,
        data: {},
        fieldPaths: {
          'notifications.player_ids':
            firestore.FieldValue.arrayRemove(deviceId),
        },
      })
    }

    return res.status(200).json({})
  } catch (error) {
    console.error(error)
    sentryCaptureException(error)
    return res.status(500).json({ error: { message: 'Internal error' } })
  }
}

export default withMiddleware({
  methods: ['POST'],
  authenticated: true,
})(handler)
