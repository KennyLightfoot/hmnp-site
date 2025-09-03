interface GHLContact {
  firstName: string
  lastName: string
  email: string
  phone: string
  address1?: string
  city?: string
  state?: string
  postalCode?: string
  customFields?: Record<string, any>
  tags?: string[]
}

interface GHLCalendarEvent {
  calendarId: string
  startTime: string
  endTime: string
  title: string
  address: string
  contactId: string
}

class GHLApiClient {
  private baseUrl: string
  private apiKey: string
  private locationId: string

  constructor() {
    this.baseUrl = process.env.GHL_BASE_URL || process.env.GHL_API_BASE_URL || "https://services.leadconnectorhq.com"
    this.apiKey = process.env.GHL_API_KEY!
    this.locationId = process.env.GHL_LOCATION_ID!
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        Version: "2021-07-28",
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[v0] GHL API Error: ${response.status} - ${errorText}`)
      throw new Error(`GHL API Error: ${response.status} - ${errorText}`)
    }

    return response.json()
  }

  async createContact(contactData: GHLContact): Promise<any> {
    console.log("[v0] Creating GHL contact:", contactData.email)

    const payload = {
      firstName: contactData.firstName,
      lastName: contactData.lastName,
      email: contactData.email,
      phone: contactData.phone,
      address1: contactData.address1,
      city: contactData.city,
      state: contactData.state || "TX",
      postalCode: contactData.postalCode,
      locationId: this.locationId,
      customFields: contactData.customFields || {},
      tags: contactData.tags || [],
    }

    return this.makeRequest("/contacts/", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  async createCalendarEvent(eventData: GHLCalendarEvent): Promise<any> {
    console.log("[v0] Creating GHL calendar event for contact:", eventData.contactId)

    const payload = {
      calendarId: eventData.calendarId,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      title: eventData.title,
      address: eventData.address,
      contactId: eventData.contactId,
    }

    return this.makeRequest("/calendars/events/", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  async triggerWorkflow(contactId: string, workflowId: string): Promise<any> {
    console.log("[v0] Triggering GHL workflow:", workflowId, "for contact:", contactId)

    const payload = {
      contactId,
      workflowId,
    }

    return this.makeRequest("/workflows/trigger", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  async updateContact(contactId: string, updateData: Partial<GHLContact>): Promise<any> {
    console.log("[v0] Updating GHL contact:", contactId)

    return this.makeRequest(`/contacts/${contactId}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    })
  }

  getCalendarIdForService(serviceType: string): string {
    const calendarMap: Record<string, string> = {
      "quick-stamp": process.env.GHL_ESSENTIAL_CALENDAR_ID!,
      standard: process.env.GHL_STANDARD_NOTARY_CALENDAR_ID!,
      extended: process.env.GHL_PRIORITY_CALENDAR_ID!,
      "loan-signing": process.env.GHL_LOAN_CALENDAR_ID!,
      ron: process.env.GHL_SPECIALTY_CALENDAR_ID!,
    }

    return calendarMap[serviceType] || process.env.GHL_BOOKING_CALENDAR_ID!
  }
}

export const ghlApi = new GHLApiClient()
