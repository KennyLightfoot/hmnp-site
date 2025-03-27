// Environment variables with type safety

// Go High Level API
export const GHL_API_KEY = process.env.GHL_API_KEY || ""
export const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL || "https://rest.gohighlevel.com/v1"

// Go High Level Calendar IDs
export const GHL_CALENDAR_IDS = {
  essential: process.env.GHL_ESSENTIAL_CALENDAR_ID || "",
  priority: process.env.GHL_PRIORITY_CALENDAR_ID || "",
  loan: process.env.GHL_LOAN_CALENDAR_ID || "",
  reverse: process.env.GHL_REVERSE_MORTGAGE_CALENDAR_ID || "",
  specialty: process.env.GHL_SPECIALTY_CALENDAR_ID || "",
  calls: process.env.GHL_CALLS_CALENDAR_ID || "",
  booking: process.env.GHL_BOOKING_CALENDAR_ID || "",
}

// Go High Level Workflow IDs
export const GHL_WORKFLOW_IDS = {
  newBooking: process.env.GHL_NEW_BOOKING_WORKFLOW_ID || "",
  newContact: process.env.GHL_NEW_CONTACT_WORKFLOW_ID || "",
  contactForm: process.env.GHL_CONTACT_FORM_WORKFLOW_ID || "",
  callRequest: process.env.GHL_CALL_REQUEST_WORKFLOW_ID || "",
}

// Google Maps API Key
export const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || ""

// Site configuration
export const SITE_CONFIG = {
  serviceName: "Houston Mobile Notary Pros",
  serviceArea: "20-mile radius from ZIP 77591",
  phone: "(281) 779-8847",
  email: "contact@houstonmobilenotarypros.com",
  address: "Houston, TX",
  businessHours: {
    essential: "Monday-Friday, 9am-5pm",
    priority: "Daily, 7am-9pm",
  },
}

