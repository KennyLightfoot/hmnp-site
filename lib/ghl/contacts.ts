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

export async function findContactByPhone(phone: string, locationId?: string) {
  const locationIdToUse = locationId || LOCATION_ID
  const normalized = String(phone || '').replace(/[^+\d]/g, '')
  const query = new URLSearchParams({ query: normalized, ...(locationIdToUse ? { locationId: locationIdToUse } : {}) }).toString()
  try {
    const data = await ghlApiRequest(`/contacts?${query}`, { method: 'GET' })
    return Array.isArray(data?.contacts) && data.contacts.length ? data.contacts[0] : null
  } catch (error: any) {
    if ((error as any).ghlError?.statusCode === 404) return null
    throw new Error(`Failed to search contact by phone: ${getErrorMessage(error)}`)
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
    const locationId = process.env.GHL_LOCATION_ID

    // 1) Fetch custom fields to map keys -> IDs (skip on failure)
    let keyToId: Record<string, string> = {}
    try {
      if (locationId) {
        // Try multiple endpoints; prefer primary
        const endpoints = [
          `/locations/${locationId}/customFields`,
          `/locations/${locationId}/custom-fields`,
          `/objects/schema/contact?locationId=${locationId}`
        ]
        for (const ep of endpoints) {
          try {
            const resp: any = await ghlApiRequest(ep, { method: 'GET' })
            const arr: any[] = Array.isArray(resp?.customFields)
              ? resp.customFields
              : Array.isArray(resp?.fields)
                ? resp.fields
                : Array.isArray(resp?.data?.customFields)
                  ? resp.data.customFields
                  : Array.isArray(resp?.data?.fields)
                    ? resp.data.fields
                    : Array.isArray(resp)
                      ? resp
                      : []
            if (arr.length) {
              for (const f of arr) {
                const id = String(f.id || '').trim()
                const key = String(f.key || f.fieldKey || '').trim()
                if (id) keyToId[id] = id
                if (key) keyToId[key] = id || key
              }
              break
            }
          } catch {
            // continue to next endpoint
          }
        }
      }
    } catch {}

    // 2) Build array payload, filtering unknown keys
    const payloadArray: Array<{ id: string; field_value: any }> = []
    for (const [k, v] of Object.entries(customFields || {})) {
      const mappedId = keyToId[k] || (keyToId[k] === '' ? '' : '')
      // Allow direct IDs as keys
      const finalId = keyToId[k] || keyToId[String(k).trim()] || (String(k).startsWith('cf_') ? keyToId[String(k)] : String(k))
      // Only push if we have a plausible ID (starts with cf_ or mapped)
      if (finalId && (finalId.startsWith('cf_') || keyToId[finalId])) {
        // Basic sanitation: stringify objects
        const fieldValue = typeof v === 'object' && v !== null ? JSON.stringify(v) : v
        payloadArray.push({ id: finalId, field_value: fieldValue })
      }
    }

    if (payloadArray.length === 0) {
      // Nothing to update; avoid 422
      return { success: true, updated: 0 }
    }

    // 3) Use array format under `customFields` per GHL expectations
    const body = {
      locationId,
      customFields: payloadArray,
    }

    return await ghlApiRequest(`/contacts/${contactId}`, { method: 'PUT', body: JSON.stringify(body) })
  } catch (error) {
    throw new Error(`Failed to update contact custom fields: ${getErrorMessage(error)}`)
  }
}


