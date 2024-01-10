import Client from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID // Account SID from www.twilio.com/console
const authToken = process.env.TWILIO_AUTH_TOKEN // Auth Token from www.twilio.com/console
export const TwilioVerificationServiceId = process.env.TWILIO_VERIFY_SERVICE_ID

export const twilio = Client(accountSid, authToken)
