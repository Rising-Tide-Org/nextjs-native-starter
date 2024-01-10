import fetch, { Response } from 'node-fetch'
import { User } from 'types/User'

// Docs: https://developers.klaviyo.com/en/reference/api_overview
export namespace Klaviyo {
  export const kListIds = {
    Subscribers: 'XVK654',
    CanceledSubscribers: 'WmjHfC',
  }

  export type Profile = {
    type: 'profile'
    id: string
    attributes: {
      email: string
      phone_number?: string
      external_id?: string
      subscriptions?: {
        email?: { marketing: { consent: 'SUBSCRIBED' | undefined } }
        sms?: { marketing: { consent: 'SUBSCRIBED' | undefined } }
      }
    }
  }

  // Docs: https://developers.klaviyo.com/en/reference/get_profiles
  export const getProfile = async (
    email: string
  ): Promise<Klaviyo.Profile | undefined> => {
    const url = `https://a.klaviyo.com/api/profiles/?filter=equals(email,${encodeURIComponent(
      `"${email}"`
    )})`
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        revision: '2023-10-15',
        Authorization: `Klaviyo-API-Key  ${process.env.KLAVIYO_PRIVATE_KEY}`,
      },
    }
    const resp = await fetch(url, options)
    const profiles = (await resp.json()).data as Klaviyo.Profile[]
    return profiles?.[0]
  }

  // Docs: https://developers.klaviyo.com/en/reference/create_profile
  export const createProfile = async (
    user: User
  ): Promise<Klaviyo.Profile | undefined> => {
    const url = 'https://a.klaviyo.com/api/profiles/'
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        revision: '2023-10-15',
        'content-type': 'application/json',
        Authorization: `Klaviyo-API-Key ${process.env.KLAVIYO_PRIVATE_KEY}`,
      },
      body: JSON.stringify({
        data: {
          type: 'profile',
          attributes: {
            email: user.email,
            phone_number: user.phone,
            external_id: user.uuid,
          },
          properties: {
            timezone: user.timezone,
          },
        },
      }),
    }

    const resp = await fetch(url, options)
    return (await resp.json())?.data as Klaviyo.Profile
  }

  // Docs: https://developers.klaviyo.com/en/reference/subscribe_profiles
  export const subscribeProfile = async (
    profile: Profile,
    listId: string,
    sourceDescription: string
  ) => {
    const url =
      'https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/'
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        revision: '2023-10-15',
        'content-type': 'application/json',
        Authorization: `Klaviyo-API-Key ${process.env.KLAVIYO_PRIVATE_KEY}`,
      },
      body: JSON.stringify({
        data: {
          type: 'profile-subscription-bulk-create-job',
          attributes: {
            custom_source: sourceDescription,
            profiles: {
              data: [
                {
                  type: 'profile',
                  id: profile.id,
                  attributes: {
                    email: profile.attributes.email,
                    phone_number: profile.attributes.phone_number,
                    subscriptions: {
                      email: { marketing: { consent: 'SUBSCRIBED' } },
                    },
                  },
                },
              ],
            },
          },
          relationships: { list: { data: { type: 'list', id: listId } } },
        },
      }),
    }

    return await fetch(url, options)
  }

  export const subscribeUserToList = async (
    email: string,
    listId: string,
    sourceDescription: string,
    user?: User
  ): Promise<Response | undefined> => {
    let profile = await Klaviyo.getProfile(email)
    if (!profile && user) {
      profile = await Klaviyo.createProfile(user)
    }

    if (!profile) {
      return undefined
    }

    return await Klaviyo.subscribeProfile(profile, listId, sourceDescription)
  }
}
