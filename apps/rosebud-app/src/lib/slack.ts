// The type of log message
type LogType = 'error' | 'info'

/**
 * Sends a log message to a Slack channel.
 *
 * - If the environment is production and the log type is 'error', the message is sent to the error channel.
 * - If the environment is not production, the message is sent to the logging channel.
 *
 * @async
 * @function logMessage
 * @param {string} source - The source of the log message.
 * @param {string} message - The message to log.
 * @param {LogType} [type='info'] - The type of log message ('error' or 'info').
 */
export const logSlackMessage = async (
  source: string,
  message: string,
  type?: LogType
) => {
  // Slack webhook URL for logging messages
  const kSlackLoggingWebhookUrl = process.env.SLACK_REMINDER_WEBHOOK_URL

  // Slack webhook URL for error messages
  const kSlackErrorWebhookUrl = process.env.SLACK_ERROR_WEBHOOK_URL

  // The type of log message to send
  const logType = type || 'info'

  // The text to send to Slack
  const text = `[${source}/${logType}]: ${message}`

  // Send message on Slack to error channel if log type is 'error'
  if (kSlackErrorWebhookUrl && logType === 'error') {
    await sendSlackMessage(text, kSlackErrorWebhookUrl)
  } else if (kSlackLoggingWebhookUrl) {
    // Send message on Slack to logging channel for everything else
    await sendSlackMessage(text, kSlackLoggingWebhookUrl)
  } else {
    console.error('No Slack webhook URL provided:', text)
  }
}

/**
 * Sends a message to a Slack channel via a webhook.
 *
 * - If no webhook URL is provided, an error is logged and an empty promise is returned.
 * - If a webhook URL is provided, a POST request is made to the URL with the message as the body.
 *
 * @async
 * @function sendSlackMessage
 * @param {string} text - The message to send.
 * @param {string} [url] - The webhook URL to send the message to.
 * @returns {Promise<Response>} A promise that resolves to the response from the Slack API.
 */
export async function sendSlackMessage(
  text: string,
  url?: string
): Promise<Response> {
  if (!url) {
    console.error('No Slack webhook URL provided')
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return Promise.resolve({} as Response)
  }

  return fetch(url, {
    body: JSON.stringify({
      text,
    }),
    method: 'POST',
  })
}
