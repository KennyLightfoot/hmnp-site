"use server"
import { createContact, triggerWorkflow, createAppointment } from "@/lib/gohighlevel"
import { savePendingSubmission } from "@/lib/form-fallback"

// Map service types to GHL calendar IDs
const SERVICE_CALENDAR_MAP: Record<string, string> = {
  essential: process.env.GHL_ESSENTIAL_CALENDAR_ID || "",
  priority: process.env.GHL_PRIORITY_CALENDAR_ID || "",
  loan: process.env.GHL_LOAN_CALENDAR_ID || "",
  reverse: process.env.GHL_REVERSE_MORTGAGE_CALENDAR_ID || "",
  specialty: process.env.GHL_SPECIALTY_CALENDAR_ID || "",
}

// Map service types to GHL tags
const SERVICE_TAG_MAP: Record<string, string> = {
  essential: "Essential Mobile Package",
  priority: "Priority Service",
  loan: "Loan Signing",
  reverse: "Reverse Mortgage",
  specialty: "Specialty Service",
}

// Workflow IDs for different actions
const WORKFLOW_IDS = {
  newBooking: process.env.GHL_NEW_BOOKING_WORKFLOW_ID || "",
  newContact: process.env.GHL_NEW_CONTACT_WORKFLOW_ID || "",
  contactForm: process.env.GHL_CONTACT_FORM_WORKFLOW_ID || "",
}

// Debug form data helper
function debugFormData(formData: FormData): Record<string, any> {
  const result: Record<string, any> = {}
  formData.forEach((value, key) => {
    result[key] = value
  })
  return result
}

export async function submitContactForm(formData: FormData) {
  try {
    // Debug form data in development
    if (process.env.NODE_ENV === "development") {
      console.log("Contact Form Data:", debugFormData(formData))
    }

    // Extract form data
    const firstName = (formData.get("firstName") as string) || ""
    const lastName = (formData.get("lastName") as string) || ""
    const email = (formData.get("email") as string) || ""
    const phone = (formData.get("phone") as string) || ""
    const interest = (formData.get("interest") as string) || ""
    const message = (formData.get("message") as string) || ""

    // Basic validation
    if (!firstName || !lastName || !email || !phone || !message) {
      return {
        success: false,
        errors: {
          _form: "All required fields must be filled out.",
        },
      }
    }

    // Create contact in GHL
    try {
      const contactData = {
        firstName,
        lastName,
        email,
        phone,
        tags: interest ? [interest] : ["Website Contact"],
        customFields: {
          message: message,
          source: "Website Contact Form",
          submittedAt: new Date().toISOString(),
        },
      }

      const contactResponse = await createContact(contactData)

      // Trigger the contact form workflow in GHL
      if (contactResponse.id && WORKFLOW_IDS.contactForm) {
        await triggerWorkflow(WORKFLOW_IDS.contactForm, contactResponse.id)
      }

      return {
        success: true,
        message: "Your message has been sent successfully.",
      }
    } catch (error) {
      console.error("Error submitting contact form:", error)

      // Save for retry later
      const submissionId = await savePendingSubmission("/contacts", {
        firstName,
        lastName,
        email,
        phone,
        tags: interest ? [interest] : ["Website Contact"],
        customFields: {
          message: message,
          source: "Website Contact Form",
          submittedAt: new Date().toISOString(),
        },
        workflowId: WORKFLOW_IDS.contactForm,
      })

      return {
        success: false,
        errors: {
          _form:
            "Failed to submit the form. Your information has been saved and will be processed when our systems are back online.",
        },
        pendingSubmissionId: submissionId,
      }
    }
  } catch (error) {
    console.error("Error in contact form submission:", error)
    return {
      success: false,
      errors: {
        _form: "An unexpected error occurred. Please try again later.",
      },
    }
  }
}

export async function submitBookingForm(formData: FormData) {
  try {
    // Debug form data in development
    if (process.env.NODE_ENV === "development") {
      console.log("Booking Form Data:", debugFormData(formData))
    }

    // Extract service details
    const serviceType = (formData.get("serviceDetails.serviceType") as string) || "essential"
    const numberOfSigners = (formData.get("serviceDetails.numberOfSigners") as string) || "1"
    const numberOfDocuments = (formData.get("serviceDetails.numberOfDocuments") as string) || "1"
    const location = (formData.get("serviceDetails.location") as string) || ""
    const documentInfo = (formData.get("serviceDetails.documentInfo") as string) || ""
    const preferredDate = (formData.get("serviceDetails.preferredDate") as string) || ""
    const preferredTime = (formData.get("serviceDetails.preferredTime") as string) || "morning"
    const weekendService = formData.get("serviceDetails.weekendService") === "true"
    const extendedTravel = formData.get("serviceDetails.extendedTravel") === "true"

    // Extract contact info
    const firstName = (formData.get("contactInfo.firstName") as string) || ""
    const lastName = (formData.get("contactInfo.lastName") as string) || ""
    const email = (formData.get("contactInfo.email") as string) || ""
    const phone = (formData.get("contactInfo.phone") as string) || ""
    const additionalInfo = (formData.get("contactInfo.additionalInfo") as string) || ""

    // Check terms agreement
    const termsAgreed = formData.get("termsAgreed") === "true"

    // Basic validation
    if (!serviceType || !location || !preferredDate || !preferredTime || !firstName || !lastName || !email || !phone) {
      return {
        success: false,
        errors: {
          _form: "All required fields must be filled out.",
        },
      }
    }

    if (!termsAgreed) {
      console.log("Terms not agreed to:", formData.get("termsAgreed"))
      return {
        success: false,
        errors: {
          _form: "You must agree to the terms of service.",
        },
      }
    }

    try {
      // Create contact in GHL
      const contactData = {
        firstName,
        lastName,
        email,
        phone,
        tags: [SERVICE_TAG_MAP[serviceType] || "New Booking"],
        customFields: {
          additionalInfo: additionalInfo || "",
          numberOfSigners,
          numberOfDocuments,
          location,
          documentInfo,
          weekendService: weekendService ? "Yes" : "No",
          extendedTravel: extendedTravel ? "Yes" : "No",
          source: "Website Booking Form",
          submittedAt: new Date().toISOString(),
        },
      }

      const contactResponse = await createContact(contactData)

      // Get the calendar ID for this service type
      const calendarId = SERVICE_CALENDAR_MAP[serviceType]

      if (!calendarId) {
        console.error(`No calendar ID found for service type: ${serviceType}`)
        return {
          success: false,
          errors: {
            _form: "Service type configuration error. Please contact support.",
          },
        }
      }

      if (contactResponse.id) {
        // Calculate appointment duration based on service type
        let durationMinutes = 60 // default
        if (serviceType === "loan" || serviceType === "reverse") {
          durationMinutes = 90
        }

        // Parse the preferred date and time to create start and end times
        const preferredDateObj = new Date(preferredDate)
        let startHour = 9 // default to 9am

        // Set the hour based on the selected time slot
        if (preferredTime === "morning") {
          startHour = 9
        } else if (preferredTime === "afternoon") {
          startHour = 13
        } else if (preferredTime === "evening") {
          startHour = 17
        }

        preferredDateObj.setHours(startHour, 0, 0, 0)
        const startTime = preferredDateObj.toISOString()

        const endDate = new Date(preferredDateObj)
        endDate.setMinutes(preferredDateObj.getMinutes() + durationMinutes)
        const endTime = endDate.toISOString()

        // Create the appointment in GHL
        const appointmentData = {
          contactId: contactResponse.id,
          calendarId,
          startTime,
          endTime,
          title: `${SERVICE_TAG_MAP[serviceType] || "Notary"} Appointment`,
          notes: `
            Service: ${SERVICE_TAG_MAP[serviceType] || serviceType}
            Signers: ${numberOfSigners}
            Documents: ${numberOfDocuments}
            Location: ${location}
            Document Info: ${documentInfo || "N/A"}
            Weekend Service: ${weekendService ? "Yes" : "No"}
            Extended Travel: ${extendedTravel ? "Yes" : "No"}
            Additional Info: ${additionalInfo || "None provided"}
          `,
          status: "scheduled",
        }

        await createAppointment(appointmentData)

        // Trigger the new booking workflow in GHL
        if (WORKFLOW_IDS.newBooking) {
          await triggerWorkflow(WORKFLOW_IDS.newBooking, contactResponse.id)
        }
      }

      return {
        success: true,
        message: "Your booking request has been submitted successfully.",
      }
    } catch (error) {
      console.error("Error submitting booking form:", error)

      // Save for retry later
      const submissionId = await savePendingSubmission("/contacts", {
        firstName,
        lastName,
        email,
        phone,
        tags: [SERVICE_TAG_MAP[serviceType] || "New Booking"],
        customFields: {
          additionalInfo: additionalInfo || "",
          numberOfSigners,
          numberOfDocuments,
          location,
          documentInfo,
          weekendService: weekendService ? "Yes" : "No",
          extendedTravel: extendedTravel ? "Yes" : "No",
          source: "Website Booking Form",
          submittedAt: new Date().toISOString(),
        },
        workflowId: WORKFLOW_IDS.newBooking,
      })

      // Also save appointment data for retry
      if (SERVICE_CALENDAR_MAP[serviceType]) {
        await savePendingSubmission("/appointments", {
          // We'll need to look up the contact ID when retrying
          contactEmail: email,
          contactPhone: phone,
          calendarId: SERVICE_CALENDAR_MAP[serviceType],
          serviceType,
          preferredDate,
          preferredTime,
          numberOfSigners,
          numberOfDocuments,
          location,
          documentInfo,
          weekendService,
          extendedTravel,
          additionalInfo,
        })
      }

      return {
        success: false,
        errors: {
          _form:
            "Failed to submit the booking. Your information has been saved and will be processed when our systems are back online.",
        },
        pendingSubmissionId: submissionId,
      }
    }
  } catch (error) {
    console.error("Error in booking form submission:", error)
    return {
      success: false,
      errors: {
        _form: "An unexpected error occurred. Please try again later.",
      },
    }
  }
}

export async function scheduleCall(formData: FormData) {
  try {
    // Debug form data in development
    if (process.env.NODE_ENV === "development") {
      console.log("Call Schedule Form Data:", debugFormData(formData))
    }

    // Extract data from form
    const name = formData.get("name") as string
    const phone = formData.get("phone") as string
    const date = formData.get("date") as string
    const time = formData.get("time") as string

    if (!name || !phone || !date || !time) {
      return {
        success: false,
        errors: {
          _form: "All fields are required.",
        },
      }
    }

    try {
      // Split name into first and last name
      const nameParts = name.split(" ")
      const firstName = nameParts[0]
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : ""

      // Create contact in GHL
      const contactData = {
        firstName,
        lastName,
        phone,
        tags: ["Call Request"],
        customFields: {
          requestedCallDate: date,
          requestedCallTime: time,
          source: "Website Call Scheduler",
          submittedAt: new Date().toISOString(),
        },
      }

      const contactResponse = await createContact(contactData)

      // Get the calendar ID for calls
      const calendarId = process.env.GHL_CALLS_CALENDAR_ID

      if (!calendarId) {
        console.error("No calendar ID found for calls")
        return {
          success: false,
          errors: {
            _form: "Call scheduling configuration error. Please contact support.",
          },
        }
      }

      if (contactResponse.id) {
        // Parse the date and time to create start and end times
        const [year, month, day] = date.split("-").map(Number)
        const [hour, minute] = time.split(":").map(Number)

        const startDate = new Date(year, month - 1, day, hour, minute)
        const startTime = startDate.toISOString()

        const endDate = new Date(startDate)
        endDate.setMinutes(startDate.getMinutes() + 30) // 30-minute call
        const endTime = endDate.toISOString()

        // Create the appointment in GHL
        const appointmentData = {
          contactId: contactResponse.id,
          calendarId,
          startTime,
          endTime,
          title: `Phone Call with ${name}`,
          notes: `Scheduled call with ${name} at ${time} on ${date}`,
          status: "scheduled",
        }

        await createAppointment(appointmentData)
      }

      return {
        success: true,
        message: "Your call has been scheduled successfully.",
      }
    } catch (error) {
      console.error("Error scheduling call:", error)

      // Save for retry later
      const submissionId = await savePendingSubmission("/contacts", {
        firstName: name.split(" ")[0],
        lastName: name.split(" ").slice(1).join(" ") || "",
        phone,
        tags: ["Call Request"],
        customFields: {
          requestedCallDate: date,
          requestedCallTime: time,
          source: "Website Call Scheduler",
          submittedAt: new Date().toISOString(),
        },
      })

      return {
        success: false,
        errors: {
          _form:
            "Failed to schedule the call. Your information has been saved and will be processed when our systems are back online.",
        },
        pendingSubmissionId: submissionId,
      }
    }
  } catch (error) {
    console.error("Error in call scheduling:", error)
    return {
      success: false,
      errors: {
        _form: "An unexpected error occurred. Please try again later.",
      },
    }
  }
}

