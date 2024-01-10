import { fetchNextApi } from 'net/api'
import { ProductFeedback } from 'types/Feedback'

/**
 * Sends feedback to an Airtable base
 * @param entries
 * @returns
 */
export const submitFeedback = (
  feedback: string,
  userId = '',
  phone = '',
  email = '',
  contactable = false,
  utmCampaign?: string
) => {
  const body: ProductFeedback = {
    feedback,
    userId,
    phone,
    email,
    contactable,
    utmCampaign,
  }
  return fetchNextApi('/api/submitFeedback', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
