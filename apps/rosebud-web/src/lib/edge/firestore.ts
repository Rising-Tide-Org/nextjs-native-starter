import FireStoreParser from 'firestore-parser'
import { Personalization } from 'types/Personalization'
import { firestoreUrl, kDatabaseName, kProjectName } from 'constants/firebase'
import { CollectionPath } from 'types/Firebase'
import { kDefaultPersonalizationId } from 'constants/defaults'

// Fetch the user's personalization from Firestore
export const fetchUserPersonalization = async (
  accessToken: string,
  uid: string,
  personalizationId = kDefaultPersonalizationId
) => {
  try {
    // Full URL path to get the user's personalization from Firestore
    const url = `${firestoreUrl}/v1/projects/${kProjectName}/databases/${kDatabaseName}/documents/users/${uid}/personalizations/${personalizationId}`

    // Fetch request to Firestore
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })

    // Get the JSON response
    const json = await response.json()

    // Parse the Firestore response into a Personalization object
    const parsedPersonalization = FireStoreParser(json)
      ?.fields as Personalization
    return parsedPersonalization
  } catch (e) {
    console.error('Error fetching personalization from Firestore', e.message)
  }
}

/**
 * Fetch a single document from a user's subcollection via Firestore REST API
 */
export const fetchOneRaw = async <T>(
  path: CollectionPath,
  accessToken: string,
  uid: string,
  documentId: string
) => {
  try {
    // Full URL path to get the user's personalization from Firestore
    const url = `${firestoreUrl}/v1/projects/${kProjectName}/databases/${kDatabaseName}/documents/users/${uid}/${path}/${documentId}`

    // Fetch request to Firestore
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })

    // Get the JSON response
    const json = await response.json()

    // Parse the Firestore response into a Personalization object
    const parsedResponse = FireStoreParser(json)?.fields as T
    return parsedResponse
  } catch (e) {
    console.error('Error fetching from Firestore', e.message)
  }
}
