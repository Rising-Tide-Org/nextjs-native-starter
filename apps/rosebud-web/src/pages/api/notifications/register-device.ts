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
import { Player } from '@onesignal/node-onesignal'
import { NotificationsVariant } from 'constants/notifications'

/**
 * register-device
 * ---------------------
 * This endpoint is responsible for registering a device to OneSignal
 * and updating the user's record with the new player ID
 *
 * It is called from the client-side when the user enables notifications
 *
 * Note: By default, registering a device will set it to the user's default channel (push, sms)
 * You can omit this behavior by passing `updateOnly: true` in the request body
 */

export type RegisterDeviceRequestBody = {
  deviceType: NotificationDeviceType
  deviceId?: string
  updateOnly?: boolean
}

const db = await (await initializeAdmin()).firestore()

const handler = async (req: NextAuthApiRequest, res: NextApiResponse) => {
  try {
    const {
      deviceType,
      deviceId,
      updateOnly = false,
    } = JSON.parse(req.body) as RegisterDeviceRequestBody

    let playerProps: Player
    const fieldPaths: Record<string, any> = updateOnly
      ? {}
      : {
          'notifications.enabled': true,
          'notifications.channel': deviceType,
        }

    const basePlayerProps = {
      app_id: process.env.ONE_SIGNAL_APP_ID,
      last_active: Math.floor(Date.now() / 1000),
      notification_types: 1, // Subscribed, -2 is unsubscribed
      language: 'en',
      country: req._user!.timezone?.startsWith('America') ? 'US' : undefined,
      external_user_id: req._user!.uuid,
      tags: {
        timezone: req._user!.timezone || 'America/New_York',
        reminder_at_utc_hour: req._user!.reminder_hour_utc,
        notifications:
          req._user!.variants?.notifications || NotificationsVariant.generic,
      },
    }

    // SMS devices are created from the server-side
    // So we need to create it, and then update the player with the data OneSignal needs
    if (deviceType === 'sms' && !updateOnly) {
      playerProps = Object.assign(basePlayerProps, {
        device_type: 14, // SMS
        identifier: req._user!.phone,
      })

      // Create OneSignal SMS player
      const player = await oneSignalClient.createPlayer(playerProps)
      fieldPaths['onesignal_id'] = player.id
    }

    // Devices for push are created from the client-side
    // So let's look it up, and then update it with the data OneSignal needs
    if (deviceType === 'push' && deviceId) {
      const playerIds = new Set<string>(req._user!.notifications?.player_ids)
      playerIds.add(deviceId)

      // If the user has other devices, update them too
      for (const playerId of playerIds) {
        const player = await oneSignalClient.getPlayer(
          process.env.ONE_SIGNAL_APP_ID!,
          playerId
        )

        playerProps = Object.assign(basePlayerProps, {
          device_type: player.device_type,
          identifier: player.identifier,
          notification_types: 1,
        })

        await oneSignalClient.updatePlayer(playerId, playerProps)
      }

      fieldPaths['notifications.player_ids'] =
        firestore.FieldValue.arrayUnion(deviceId)
    }

    // Finally, update the user record with the new player ID
    await updateRecord<User>(db, 'users', req._user!.id!, {
      userId: req._user!.id!,
      fieldPaths,
    })

    return res.status(201).json({})
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
