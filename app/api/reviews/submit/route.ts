import { NextResponse } from "next/server"

// --- GHL API Configuration (Ensure these are in your .env.local) ---
const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL
const GHL_API_KEY = process.env.GHL_API_KEY
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID
// --- You might need a specific GHL endpoint/workflow ID for reviews ---
// const GHL_REVIEWS_ENDPOINT = process.env.GHL_REVIEWS_ENDPOINT; // Example - Check GHL Docs

// --- Helper Functions (Similar to booking/contact routes) ---

// Helper function to search for a contact by email in GHL
async function findContactByEmail(email: string) {
  if (!GHL_API_BASE_URL || !GHL_API_KEY || !GHL_LOCATION_ID) {
    throw new Error("GHL API credentials or Location ID are not configured.")
  }
  const query = new URLSearchParams({
    locationId: GHL_LOCATION_ID,
    query: email,
  }).toString()

  const response = await fetch(`${GHL_API_BASE_URL}/contacts/lookup?${query}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${GHL_API_KEY}`,
      Version: "V2", // Or your specific API version
      Accept: "application/json",
    },
  })

  if (!response.ok) {
    if (response.status === 404) {
      return null // No contact found
    }
    const errorData = await response.json().catch(() => ({}))
    console.error(`GHL API Error (findContactByEmail for ${email}): ${JSON.stringify(errorData)}`, { status: response.status })
    throw new Error(`Failed to search contact: Status ${response.status}`)
  }

  const data = await response.json()
  return data.contacts && data.contacts.length > 0 ? data.contacts[0] : null
}

// Helper function to potentially create a contact if needed (Optional - decide if reviews require existing contact)
async function createContact(contactData: any) {
   if (!GHL_API_BASE_URL || !GHL_API_KEY || !GHL_LOCATION_ID) {
    throw new Error("GHL API credentials or Location ID are not configured.")
  }
  const response = await fetch(`${GHL_API_BASE_URL}/contacts/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GHL_API_KEY}`,
      Version: "V2",
    },
    body: JSON.stringify({
      locationId: GHL_LOCATION_ID,
      ...contactData,
    }),
  })

  if (!response.ok) {
     // Handle potential duplicate contact error gracefully if GHL API supports it
     const errorData = await response.json().catch(() => ({ message: "Failed to parse error JSON" }))
     if (response.status === 400 && errorData.message?.includes("duplicated contacts")) {
        console.warn(`Attempted duplicate contact creation for ${contactData.email}, proceeding might require lookup.`);
        // Depending on GHL behavior, you might get an ID here or need to re-lookup
        return null; // Indicate creation failed but might exist
     }
     console.error("GHL API Error (createContact):", errorData)
    throw new Error(`Failed to create contact: ${JSON.stringify(errorData)}`)
  }
  return response.json()
}

// --- Main POST Handler ---

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, rating, reviewText, service, date } = body

    // Basic validation
    if (!name || !email || !rating || !reviewText || !service || !date) {
      return NextResponse.json({ success: false, message: "Missing required review fields." }, { status: 400 })
    }

    // 1. Find contact by email
    const contact = await findContactByEmail(email)
    const contactId: string | null = contact?.id

    // 2. Contact must exist to submit a review
    if (!contactId) {
      console.warn(`Review submission failed: Contact not found for email ${email}.`)
      // Return a user-friendly error, maybe suggest they need to be a customer?
      return NextResponse.json({ success: false, message: "Could not find an existing contact associated with this email address." }, { status: 404 }) // Use 404 Not Found
    }

    console.log(`Submitting review for contact ID: ${contactId}`)

    // 3. --- IMPORTANT: Call GHL Review Submission API ---
    // This is the part that needs verification with GHL Docs.
    // Replace 'YOUR_GHL_REVIEW_SUBMISSION_ENDPOINT' with the actual endpoint.
    // Adjust the 'reviewPayload' structure based on GHL's requirements.

    // Example structure - **NEEDS VERIFICATION**
    const reviewPayload = {
      contactId: contactId,
      rating: rating, // Ensure rating format (e.g., number 1-5) matches GHL's expectation
      body: reviewText, // Or maybe 'comment', 'content' etc.
      reviewSource: "Website", // Or appropriate source identifier
      serviceUsed: service, // Custom field? Standard field?
      reviewDate: date, // Ensure date format matches GHL's expectation
      // Add any other required or optional fields by GHL
    };

    // Replace with the actual endpoint path if different
    const ghlReviewEndpoint = `${GHL_API_BASE_URL}/reviews`; // <<< VERIFY THIS GHL ENDPOINT PATH

    const reviewResponse = await fetch(ghlReviewEndpoint, {
        method: "POST", // Or PUT/PATCH if updating existing review structures?
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GHL_API_KEY}`,
          Version: "V2", // Or your specific API version
        },
        body: JSON.stringify(reviewPayload),
      });

    if (!reviewResponse.ok) {
        const errorData = await reviewResponse.json().catch(() => ({}));
        console.error("GHL API Error (submitReview):", errorData);
        throw new Error(`Failed to submit review to GHL: Status ${reviewResponse.status} - ${JSON.stringify(errorData)}`);
    }

    const reviewResult = await reviewResponse.json();
    console.log("GHL Review Submission Result:", reviewResult);

    // 4. Return success response (matching the format expected by safeFormSubmit)
    return NextResponse.json({
      success: true,
      message: "Review submitted successfully!",
      data: reviewResult // Optionally return GHL's response data
    })

  } catch (error) {
    console.error("Review submission API error:", error)
    const message = error instanceof Error ? error.message : "An unknown error occurred during review submission."
    // Ensure the error response format matches what safeFormSubmit expects
    return NextResponse.json(
      {
        success: false,
        message: message,
      },
      { status: 500 },
    )
  }
} 