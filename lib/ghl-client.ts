/**
 * GoHighLevel API Client
 * This client handles API requests to the GoHighLevel API using the Private Integration Token
 */

// Base URL for the GoHighLevel API
const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL || "https://services.leadconnectorhq.com"

// API version to use
const API_VERSION = "2021-07-28"

/**
 * Creates the headers for GoHighLevel API requests
 * @returns {Headers} The headers to use for API requests
 */
function createHeaders() {
  const headers = new Headers()

  // Add the Private Integration Token (PIT) to the Authorization header
  // Note: Do NOT add "Bearer" prefix for PIT tokens
  headers.append("Authorization", process.env.GHL_API_KEY || "")

  // Add the API version
  headers.append("Version", API_VERSION)

  // Add Accept and Content-Type headers
  headers.append("Accept", "application/json")
  headers.append("Content-Type", "application/json")

  return headers
}

/**
 * Makes a request to the GoHighLevel API
 * @param {string} endpoint - The API endpoint to call
 * @param {object} options - Additional fetch options
 * @returns {Promise<any>} The API response
 */
export async function ghlRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${GHL_API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`

  // Create default headers
  const headers = createHeaders()

  // Merge with any custom headers
  const mergedOptions = {
    ...options,
    headers: {
      ...Object.fromEntries(headers.entries()),
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, mergedOptions)

    // Check if the response is OK
    if (!response.ok) {
      // Try to parse error response
      let errorData
      try {
        errorData = await response.json()
      } catch (e) {
        errorData = await response.text()
      }

      throw new Error(
        JSON.stringify({
          status: response.status,
          statusText: response.statusText,
          data: errorData,
        }),
      )
    }

    // Parse and return the response
    return await response.json()
  } catch (error) {
    console.error("GHL API request failed:", error)
    throw error
  }
}

/**
 * Get a list of locations
 * @returns {Promise<any>} The locations response
 */
export async function getLocations() {
  return ghlRequest("locations")
}

/**
 * Get a list of contacts
 * @param {string} locationId - The location ID
 * @param {object} params - Query parameters
 * @returns {Promise<any>} The contacts response
 */
export async function getContacts(locationId: string, params: Record<string, string> = {}) {
  const queryParams = new URLSearchParams(params).toString()
  return ghlRequest(`contacts?locationId=${locationId}${queryParams ? `&${queryParams}` : ""}`)
}

/**
 * Create a new contact
 * @param {string} locationId - The location ID
 * @param {object} contactData - The contact data
 * @returns {Promise<any>} The created contact
 */
export async function createContact(locationId: string, contactData: any) {
  return ghlRequest("contacts", {
    method: "POST",
    body: JSON.stringify({
      ...contactData,
      locationId,
    }),
  })
}

/**
 * Trigger a workflow
 * @param {string} workflowId - The workflow ID
 * @param {object} data - The data to pass to the workflow
 * @returns {Promise<any>} The workflow response
 */
export async function triggerWorkflow(workflowId: string, data: any) {
  return ghlRequest(`workflows/${workflowId}/trigger`, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

/**
 * Get a list of calendars
 * @param {string} locationId - The location ID
 * @returns {Promise<any>} The calendars response
 */
export async function getCalendars(locationId: string) {
  return ghlRequest(`calendars?locationId=${locationId}`)
}

/**
 * Get available slots for a calendar
 * @param {string} calendarId - The calendar ID
 * @param {string} startDate - The start date (YYYY-MM-DD)
 * @param {string} endDate - The end date (YYYY-MM-DD)
 * @returns {Promise<any>} The available slots
 */
export async function getCalendarAvailability(calendarId: string, startDate: string, endDate: string) {
  return ghlRequest(`calendars/${calendarId}/availability?startDate=${startDate}&endDate=${endDate}`)
}

/**
 * Create a new appointment
 * @param {string} calendarId - The calendar ID
 * @param {object} appointmentData - The appointment data
 * @returns {Promise<any>} The created appointment
 */
export async function createAppointment(calendarId: string, appointmentData: any) {
  return ghlRequest(`appointments`, {
    method: "POST",
    body: JSON.stringify({
      ...appointmentData,
      calendarId,
    }),
  })
}

