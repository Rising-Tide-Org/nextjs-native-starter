import { sendDailyReminderBatch } from './onesignal'
import { logSlackMessage } from './slack'

// The source of the file for logging purposes
const source = 'dispatch-reminders'

/**
 * Display daily reminders
 * @param utcHour Corresponds to the tag value for the user's reminder hour
 * @param test If true, prints payload to console without sending anything
 * @returns
 */
export async function dispatchReminders(utcHour: number, test: boolean) {
  // Dispatch daily sms reminders
  try {
    await sendDailyReminderBatch(utcHour, 'sms', test)
  } catch (e) {
    const errorMessage = `unable to send generic sms notifications @ ${utcHour} hours UTC ${e?.message}`
    logSlackMessage(source, errorMessage, 'error')
    throw new Error(e)
  }

  // Dispatch daily push reminders
  try {
    await sendDailyReminderBatch(utcHour, 'push', test)
  } catch (e) {
    const errorMessage = `unable to send generic push notifications @ ${utcHour} hours UTC ${e?.message}`
    logSlackMessage(source, errorMessage, 'error')
    throw new Error(e)
  }
}
