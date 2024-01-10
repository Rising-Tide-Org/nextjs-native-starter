import fetch from 'node-fetch'
import Analytics from './analytics'

// Docs: https://airtable.com/developers/web/api/introduction
export namespace Airtable {
  // Docs: https://airtable.com/developers/web/api/create-records
  export const createRecord = async (
    url: string,
    record: Record<string, unknown>
  ) => {
    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [
          {
            fields: record,
          },
        ],
      }),
    }

    const resp = await fetch(url, options)

    // Apparently sometimes it returns a string so need to check content type
    let atResponseBody = null
    const contentType = resp.headers.get('content-type')
    if (contentType && contentType.indexOf('application/json') !== -1) {
      atResponseBody = await resp.json()
    } else {
      atResponseBody = await resp.text()
      Analytics.trackEvent('airtable.response.text', { text: atResponseBody })
    }

    if (atResponseBody.error) {
      throw new Error(atResponseBody.error.message)
    }

    return resp
  }
}
