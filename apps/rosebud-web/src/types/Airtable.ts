/**
 * Airtable Feedback Fields:
 * This must match the field names in Airtable. If it does not, Airtable will throw an error. Confirm before changing.
 * Database: https://airtable.com/appNlk8vk5UB4kQ5U/tblgnanwc7K18My1N/viwMiHsrMgp9Q6msp?blocks=hide
 */
export type AirtableFeedbackTableFields = {
  UserID: string
  Email: string
  Phone: string
  Contactable: boolean
  Feedback: string
}

/**
 * Airtable Cancellation Feedback Fields:
 * This must match the field names in Airtable. If it does not, Airtable will throw an error. Confirm before changing.
 * Database: https://airtable.com/appNlk8vk5UB4kQ5U/tbl2Ko4FkqXtWBn8n/viw18e7OmJ0IuThaF?blocks=hide
 */
export type AirtableCancellationFeedbackFields = {
  UserID: string
  Email: string
  Phone: string
  Reason: string
  More_Details: string
  SubscriptionID: string
  Type: string
  Tier: string
  Price: string
  Interval: string
  Retention?: string
  Utm_Campaign?: string
  Canceled_At?: Date
}
