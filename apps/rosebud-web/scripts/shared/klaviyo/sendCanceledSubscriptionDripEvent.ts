import 'dotenv/config'
import { Klaviyo } from 'lib/klaviyo'

import logger from '../logger'

export const sendCanceledSubscriptionDripEvent = async (email: string) => {
  try {
    // Susbcribe user to CanceledSubscribers event
    const response = await Klaviyo.subscribeUserToList(
      email,
      Klaviyo.kListIds.CanceledSubscribers,
      'Canceled Subscription'
    )

    if (response && response.status < 300) {
      // logger.info(`Drip event sent: ${email}`)
    } else {
      logger.error(
        `Drip event failed: ${email}\nStatus: ${
          response ? response.status : 'No response received.\n'
        }`
      )
    }
  } catch (error) {
    logger.error('Unable to send drip event', error)
  }
}
