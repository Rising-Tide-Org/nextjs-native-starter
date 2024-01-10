export const getProductFeedbackSlackMessage = (
  userId: string,
  feedback: string,
  phone: string,
  email: string,
  utmCampaign?: string
): string => {
  const contactMethod = email || phone || 'guest'
  const utmCampaignName = utmCampaign ? `(${utmCampaign})` : ''

  const message = `> ${feedback}
${contactMethod} [<https://mixpanel.com/project/2935319/view/3459939/app/profile#distinct_id=${userId}|M>] ${utmCampaignName}`

  return message
}

// Returns a message containing relevant information about a user's subscription
// This is used when a user cancels their subscription from the in-product flow
// This is formatted to be sent to Slack
export const getSubCancelledInProductSlackMessage = (
  userId: string,
  email: string,
  phone: string,
  reason: string,
  moreDetails: string,
  customerId: string,
  type: string,
  tier: string,
  price: string,
  interval: string,
  retention?: string,
  utmCampaign?: string
): string => {
  const contactMethod = email || phone || 'guest'
  const utmCampaignName = utmCampaign ? `(${utmCampaign})` : ''

  let message = `> ${moreDetails}
reason: ${reason}
${type}: ${tier} (${price}/${interval})`

  if (retention) {
    message += `\nretention: ${retention}`
  }

  message += `\n${contactMethod} [<https://mixpanel.com/project/2935319/view/3459939/app/profile#distinct_id=${userId}|M>] [<https://dashboard.stripe.com/customers/${customerId}|S>] ${utmCampaignName}`

  return message
}
