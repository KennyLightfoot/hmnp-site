// GoHighLevel v2 API integration
const API_BASE_URL = "https://rest.gohighlevel.com/v1"
const API_KEY = process.env.GHL_API_KEY
const API_VERSION = "2021-07-28"
const LOCATION_ID = process.env.GHL_LOCATION_ID

// Custom field names mapping
export const CUSTOM_FIELD_NAMES = {
  message: "message",
  source: "source",
  submittedAt: "submittedAt",
  additionalInfo: "additionalInfo",
  numberOfSigners: "numberOfSigners",
  numberOfDocuments: "numberOfDocuments",
  location: "location",
  documentInfo: "documentInfo",
  weekendService: "weekendService",
  extendedTravel: "extendedTravel",
  requestedCallDate: "requestedCallDate",
  requestedCallTime: "requestedCallTime",
}

// API health status tracking
const apiHealthStatus = {
  healthy: true,
  lastChecked: Date.now(),
  retryCount: 0,
  maxRetries: 5,
}

export function getApiHealthStatus() {
  return apiHealthStatus
}

// Helper function to make API requests
export async function makeRequest(endpoint: string, method = "GET", data?: any) {
  if (!API_KEY) {
    throw new Error("GoHighLevel API key is not configured")
  }

  if (!LOCATION_ID) {
    throw new Error("GoHighLevel location ID is not configured")
  }

  try {
    const url = `${API_BASE_URL}${endpoint}`
    console.log(`Making GHL API request to: ${url}`)

    // Set up headers according to GHL v2 documentation
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${API_KEY}`,
    }

    // Log request details for debugging (redact sensitive parts of the key)
    const redactedKey = API_KEY.substring(0, 5) + "..." + API_KEY.substring(API_KEY.length - 5)
    console.log(`Request headers: Authorization: Bearer ${redactedKey}`)

    const requestOptions: RequestInit = {
      method,
      headers,
      cache: "no-store",
    }

    if (data) {
      requestOptions.body = JSON.stringify(data)
      console.log(`Request body: ${JSON.stringify(data, null, 2)}`)
    }

    const response = await fetch(url, requestOptions)

    // Reset health status on successful request
    apiHealthStatus.healthy = true
    apiHealthStatus.lastChecked = Date.now()
    apiHealthStatus.retryCount = 0

    // Handle non-200 responses
    if (!response.ok) {
      let errorData: any = {}

      // Try to parse error as JSON
      try {
        errorData = await response.json()
      } catch (e) {
        // If not JSON, try to get text
        try {
          errorData = { message: await response.text() }
        } catch (e2) {
          // If text fails too, use status text
          errorData = { message: response.statusText }
        }
      }

      console.error(`GHL API Error (${response.status}):`, errorData)

      // Mark API as unhealthy for certain error codes
      if (response.status >= 500 || response.status === 429) {
        apiHealthStatus.healthy = false
        apiHealthStatus.retryCount += 1
      }

      throw new Error(`GHL API Error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`)
    }

    // Parse successful response
    const responseData = await response.json()
    console.log(`Response status: ${response.status}`)
    console.log(`Response data (truncated): ${JSON.stringify(responseData).substring(0, 500)}...`)
    return responseData
  } catch (error) {
    console.error("GHL API Request Failed:", error)

    // Mark API as unhealthy on network errors
    apiHealthStatus.healthy = false
    apiHealthStatus.retryCount += 1

    throw error
  }
}

// Get location ID - many endpoints require this
export async function getLocationId(): Promise<string> {
  try {
    // Direct API call to get locations - updated for v2 API
    const response = await makeRequest("/locations/list")

    // Log the full response for debugging
    console.log(`Locations response: ${JSON.stringify(response, null, 2)}`)

    // Check if we have locations in the response
    if (!response.locations || response.locations.length === 0) {
      throw new Error("No locations found in your GoHighLevel account")
    }

    // Return the first location ID
    return response.locations[0].id
  } catch (error) {
    console.error("Failed to get location ID:", error)
    throw new Error(`Failed to get location ID: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Contact API
export interface ContactData {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  tags?: string[]
  customFields?: Record<string, string>
}

export interface ContactResponse {
  id: string
  [key: string]: any
}

export async function createContact(data: ContactData): Promise<ContactResponse> {
  // Validate required fields
  if (!data.firstName || !data.lastName) {
    throw new Error("First name and last name are required")
  }

  // Ensure at least email or phone is provided
  if (!data.email && !data.phone) {
    throw new Error("Either email or phone is required")
  }

  // Format phone number if present (remove non-numeric characters)
  if (data.phone) {
    data.phone = data.phone.replace(/\D/g, "")

    // Add country code if not present
    if (data.phone.length === 10) {
      data.phone = `1${data.phone}`
    }
  }

  try {
    // Get location ID first
    const locationId = await getLocationId()

    // Map to GHL expected format for v2 API
    const ghlData: any = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || "",
      phone: data.phone || "",
      tags: data.tags || [],
    }

    // Add custom fields if provided - v2 format
    if (data.customFields && Object.keys(data.customFields).length > 0) {
      ghlData.customFields = {}

      Object.entries(data.customFields).forEach(([key, value]) => {
        const fieldName = CUSTOM_FIELD_NAMES[key as keyof typeof CUSTOM_FIELD_NAMES] || key
        ghlData.customFields[fieldName] = value
      })
    }

    // Use location-specific endpoint
    return makeRequest(`/locations/${locationId}/contacts`, "POST", ghlData)
  } catch (error) {
    console.error("Failed to create contact:", error)
    throw error
  }
}

export async function updateContact(contactId: string, data: Partial<ContactData>): Promise<ContactResponse> {
  try {
    // Get location ID first
    const locationId = await getLocationId()

    // Format phone number if present
    if (data.phone) {
      data.phone = data.phone.replace(/\D/g, "")

      // Add country code if not present
      if (data.phone.length === 10) {
        data.phone = `1${data.phone}`
      }
    }

    // Map to GHL expected format for v2 API
    const ghlData: any = {}

    if (data.firstName) ghlData.firstName = data.firstName
    if (data.lastName) ghlData.lastName = data.lastName
    if (data.email) ghlData.email = data.email
    if (data.phone) ghlData.phone = data.phone
    if (data.tags) ghlData.tags = data.tags

    // Add custom fields if provided - v2 format
    if (data.customFields && Object.keys(data.customFields).length > 0) {
      ghlData.customFields = {}

      Object.entries(data.customFields).forEach(([key, value]) => {
        const fieldName = CUSTOM_FIELD_NAMES[key as keyof typeof CUSTOM_FIELD_NAMES] || key
        ghlData.customFields[fieldName] = value
      })
    }

    // Use location-specific endpoint
    return makeRequest(`/locations/${locationId}/contacts/${contactId}`, "PUT", ghlData)
  } catch (error) {
    console.error("Failed to update contact:", error)
    throw error
  }
}

export async function getContact(contactId: string): Promise<ContactResponse> {
  try {
    // Get location ID first
    const locationId = await getLocationId()

    // Use location-specific endpoint
    return makeRequest(`/locations/${locationId}/contacts/${contactId}`)
  } catch (error) {
    console.error("Failed to get contact:", error)
    throw error
  }
}

export async function searchContacts(query: string): Promise<ContactResponse[]> {
  try {
    // Get location ID first
    const locationId = await getLocationId()

    // Use location-specific endpoint
    const response = await makeRequest(`/locations/${locationId}/contacts/search?query=${encodeURIComponent(query)}`)
    return response.contacts || []
  } catch (error) {
    console.error("Failed to search contacts:", error)
    throw error
  }
}

// Workflow API
export async function triggerWorkflow(workflowId: string, contactId: string, data?: any): Promise<any> {
  if (!workflowId) {
    throw new Error("Workflow ID is required")
  }

  if (!contactId) {
    throw new Error("Contact ID is required")
  }

  try {
    // Get location ID first
    const locationId = await getLocationId()

    const payload = {
      contactId,
      ...(data || {}),
    }

    // Use location-specific endpoint
    return makeRequest(`/locations/${locationId}/workflows/${workflowId}/run`, "POST", payload)
  } catch (error) {
    console.error("Failed to trigger workflow:", error)
    throw error
  }
}

// Appointment API
export interface AppointmentData {
  contactId: string
  calendarId: string
  startTime: string // ISO string
  endTime: string // ISO string
  title: string
  notes?: string
  status?: "scheduled" | "confirmed" | "completed" | "canceled"
}

export async function createAppointment(data: AppointmentData): Promise<any> {
  // Validate required fields
  if (!data.contactId || !data.calendarId || !data.startTime || !data.endTime || !data.title) {
    throw new Error("Missing required appointment fields")
  }

  try {
    // Get location ID first
    const locationId = await getLocationId()

    // Map to GHL expected format for v2 API
    const ghlData = {
      contactId: data.contactId,
      calendarId: data.calendarId,
      startTime: data.startTime,
      endTime: data.endTime,
      title: data.title,
      description: data.notes || "",
      status: data.status || "scheduled",
    }

    // Use location-specific endpoint
    return makeRequest(`/locations/${locationId}/appointments`, "POST", ghlData)
  } catch (error) {
    console.error("Failed to create appointment:", error)
    throw error
  }
}

export async function updateAppointment(appointmentId: string, data: Partial<AppointmentData>): Promise<any> {
  try {
    // Get location ID first
    const locationId = await getLocationId()

    // Map to GHL expected format for v2 API
    const ghlData: any = {}

    if (data.startTime) ghlData.startTime = data.startTime
    if (data.endTime) ghlData.endTime = data.endTime
    if (data.title) ghlData.title = data.title
    if (data.notes) ghlData.description = data.notes
    if (data.status) ghlData.status = data.status

    // Use location-specific endpoint
    return makeRequest(`/locations/${locationId}/appointments/${appointmentId}`, "PUT", ghlData)
  } catch (error) {
    console.error("Failed to update appointment:", error)
    throw error
  }
}

export async function getAppointment(appointmentId: string): Promise<any> {
  try {
    // Get location ID first
    const locationId = await getLocationId()

    // Use location-specific endpoint
    return makeRequest(`/locations/${locationId}/appointments/${appointmentId}`)
  } catch (error) {
    console.error("Failed to get appointment:", error)
    throw error
  }
}

// Updated calendar endpoint for v2 API
export async function getCalendars(): Promise<any> {
  try {
    // Get location ID first
    const locationId = await getLocationId()

    // Use location-specific endpoint
    const response = await makeRequest(`/locations/${locationId}/calendars`)
    return response.calendars || []
  } catch (error) {
    console.error("Failed to get calendars:", error)
    throw error
  }
}

// Location API
export async function getLocations(): Promise<any> {
  try {
    const response = await makeRequest("/locations")
    return response.locations || []
  } catch (error) {
    console.error("Failed to get locations:", error)
    throw error
  }
}

// Custom Fields API
export async function getCustomFields(): Promise<any> {
  try {
    // Get location ID first
    const locationId = await getLocationId()

    // Use location-specific endpoint
    const response = await makeRequest(`/locations/${locationId}/customFields`)
    return response.customFields || []
  } catch (error) {
    console.error("Failed to get custom fields:", error)
    throw error
  }
}

// Tags API
export async function getTags(): Promise<any> {
  try {
    // Get location ID first
    const locationId = await getLocationId()

    // Use location-specific endpoint
    const response = await makeRequest(`/locations/${locationId}/tags`)
    return response.tags || []
  } catch (error) {
    console.error("Failed to get tags:", error)
    throw error
  }
}

// Export contacts data
export async function exportContacts(filters?: {
  tags?: string[]
  dateRange?: { start: string; end: string }
  limit?: number
}): Promise<any> {
  try {
    // Get location ID first
    const locationId = await getLocationId()

    let endpoint = `/locations/${locationId}/contacts?limit=${filters?.limit || 100}`

    // Add tag filtering if provided
    if (filters?.tags && filters.tags.length > 0) {
      endpoint += `&tags=${filters.tags.join(",")}`
    }

    // Add date range filtering if provided
    if (filters?.dateRange) {
      endpoint += `&createdAt[gte]=${filters.dateRange.start}&createdAt[lte]=${filters.dateRange.end}`
    }

    const response = await makeRequest(endpoint)
    return response.contacts || []
  } catch (error) {
    console.error("Failed to export contacts:", error)
    throw error
  }
}

// Export appointments data
export async function exportAppointments(filters?: {
  calendarId?: string
  dateRange?: { start: string; end: string }
  status?: string
  limit?: number
}): Promise<any> {
  try {
    // Get location ID first
    const locationId = await getLocationId()

    let endpoint = `/locations/${locationId}/appointments?limit=${filters?.limit || 100}`

    // Add calendar filtering if provided
    if (filters?.calendarId) {
      endpoint += `&calendarId=${filters.calendarId}`
    }

    // Add date range filtering if provided
    if (filters?.dateRange) {
      endpoint += `&startTime[gte]=${filters.dateRange.start}&startTime[lte]=${filters.dateRange.end}`
    }

    // Add status filtering if provided
    if (filters?.status) {
      endpoint += `&status=${filters.status}`
    }

    const response = await makeRequest(endpoint)
    return response.appointments || []
  } catch (error) {
    console.error("Failed to export appointments:", error)
    throw error
  }
}

// Retry mechanism for pending submissions
export async function retryPendingSubmissions() {
  try {
    const { retryPendingSubmissions: retry } = await import("./form-fallback")
    return retry()
  } catch (error) {
    console.error("Failed to retry pending submissions:", error)
    throw error
  }
}

// Get pending submissions
export async function getPendingSubmissions() {
  try {
    const { getPendingSubmissions: getSubmissions } = await import("./form-fallback")
    return getSubmissions()
  } catch (error) {
    console.error("Failed to get pending submissions:", error)
    return []
  }
}

