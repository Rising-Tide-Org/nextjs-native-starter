// import { RegisterDeviceRequestBody } from 'pages/api/notifications/register-device'

// TODO: this onesignal file should be a shared pkg where it can access this type ^ 
// from the web app project.
type RegisterDeviceRequestBody = {
  deviceType: NotificationDeviceType
  deviceId?: string
  updateOnly?: boolean
}

import { Device } from 'types/Api'
import { NotificationDeviceType } from 'types/Notification'
import { fetchNextApi } from '../api'

/**
 * Registers a new device for OneSignal notifications
 * @param deviceType - type of device (push, sms)
 * @param deviceId - id of device (player_id, not needed for sms)
 * @param updateOnly - if false, will change the user's channel to this device
 */
export async function registerDevice({
  deviceType,
  deviceId,
  updateOnly = false,
}: RegisterDeviceRequestBody): Promise<Boolean> {
  const resp = await fetchNextApi<Device.Create.Response>(
    '/api/notifications/register-device',
    {
      method: 'POST',
      body: JSON.stringify({ deviceType, deviceId, updateOnly }),
      headers: {
        Accept: 'application/json',
      },
    }
  )

  if (resp.error) {
    throw resp.error
  }

  return true
}

/**
 * Unregisters a device from OneSignal notifications
 * @param deviceType (push, sms)
 * @param deviceId (player_id, not needed for sms)
 * @returns
 */
export async function unregisterDevice(
  deviceType: NotificationDeviceType,
  deviceId: string
): Promise<Boolean> {
  const resp = await fetchNextApi<Device.Create.Response>(
    '/api/notifications/unregister-device',
    {
      method: 'POST',
      body: JSON.stringify({ deviceType, deviceId }),
      headers: {
        Accept: 'application/json',
      },
    }
  )

  if (resp.error) {
    throw resp.error
  }

  return true
}
