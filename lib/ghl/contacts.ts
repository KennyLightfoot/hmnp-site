import { ghlApiRequest } from './error-handler'
import { getCleanEnv } from '@/lib/env-clean'
import { getErrorMessage } from '@/lib/utils/error-utils'

const LOCATION_ID = getCleanEnv('GHL_LOCATION_ID')

export async function findContactByEmail(email: string, locationId?: string) {
  const locationIdToUse = locationId || LOCATION_ID
  const query = new URLSearchParams({ query: email, ...(locationIdToUse ? { locationId: locationIdToUse } : {}) }).toString()
  try {
    const data = await ghlApiRequest(`/contacts?${query}`, { method: 'GET' })
    return Array.isArray(data?.contacts) && data.contacts.length ? data.contacts[0] : null
  } catch (error: any) {
    if ((error as any).ghlError?.statusCode === 404) return null
    throw new Error(`Failed to search contact: ${getErrorMessage(error)}`)
  }
}

export async function createContact(contactData: any, locationId?: string) {
  const locationIdToUse = locationId || LOCATION_ID
  if (!locationIdToUse) throw new Error('No location ID provided or available in environment.')
  const payload = { locationId: locationIdToUse, ...contactData }
  try {
    return await ghlApiRequest('/contacts', { method: 'POST', body: JSON.stringify(payload) })
  } catch (error: any) {
    const message = getErrorMessage(error)
    if ((error as any).ghlError?.statusCode === 400 && message.includes('duplicate')) {
      const existing = await findContactByEmail(contactData.email, locationId)
      if (existing) return existing
    }
    throw new Error(`Failed to create contact: ${message}`)
  }
}

export async function updateContact(contactData: { id: string; [k: string]: any }) {
  const { id, ...updateData } = contactData
  try {
    return await ghlApiRequest(`/contacts/${id}`, { method: 'PUT', body: JSON.stringify(updateData) })
  } catch (error) {
    throw new Error(`Failed to update contact: ${getErrorMessage(error)}`)
  }
}

export async function addTagsToContact(contactId: string, tags: string[]) {
  try {
    return await ghlApiRequest(`/contacts/${contactId}/tags`, { method: 'POST', body: JSON.stringify({ tags }) })
  } catch (error) {
    throw new Error(`Failed to add tags to contact: ${getErrorMessage(error)}`)
  }
}

export async function removeTagsFromContact(contactId: string, tags: string[]) {
  const promises = tags.map((tag) => ghlApiRequest(`/contacts/${contactId}/tags/${encodeURIComponent(tag)}`, { method: 'DELETE' }))
  await Promise.allSettled(promises)
  return { success: true }
}

export async function updateContactCustomFields(contactId: string, customFields: Record<string, any>) {
  try {
    // Updated for PIT-compatible endpoint: update contact with customField payload
    const body = {
      // Some PIT flows require location in body for PUT /contacts/{id}
      locationId: process.env.GHL_LOCATION_ID,
      customField: customFields,
    }
    return await ghlApiRequest(`/contacts/${contactId}`, { method: 'PUT', body: JSON.stringify(body) })
  } catch (error) {
    throw new Error(`Failed to update contact custom fields: ${getErrorMessage(error)}`)
  }
}


