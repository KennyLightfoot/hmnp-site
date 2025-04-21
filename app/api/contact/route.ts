import { Resend } from 'resend';
import { NextResponse } from 'next/server';

// GHL API base URL from environment variable
const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL
const GHL_API_KEY = process.env.GHL_API_KEY
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID
const GHL_CONTACT_FORM_WORKFLOW_ID = process.env.GHL_CONTACT_FORM_WORKFLOW_ID

// Resend Configuration
const resend = new Resend(process.env.RESEND_API_KEY);
const notificationEmailTo = process.env.CONTACT_FORM_RECEIVER_EMAIL || 'your-receiving-email@example.com';
const emailFrom = process.env.CONTACT_FORM_SENDER_EMAIL || 'noreply@yourdomain.com';

// Helper function to create a contact in GHL
async function createContact(contactData: any) {
  if (!GHL_API_BASE_URL || !GHL_API_KEY || !GHL_LOCATION_ID) {
    console.warn("GHL API credentials or Location ID missing, skipping GHL contact creation.");
    return { id: null }; // Return a dummy object to avoid breaking the flow
  }
  const response = await fetch(`${GHL_API_BASE_URL}/contacts`, {
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
    const errorData = await response.json()
    throw new Error(`Failed to create contact in GHL: ${JSON.stringify(errorData)}`)
  }

  return response.json()
}

// Helper function to create a task/note in GHL
async function createNote(contactId: string, message: string) {
  if (!contactId || !GHL_API_BASE_URL || !GHL_API_KEY) {
      console.warn("Missing contactId or GHL API credentials, skipping GHL note creation.");
      return null;
  }
  const response = await fetch(`${GHL_API_BASE_URL}/contacts/${contactId}/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GHL_API_KEY}`,
      Version: "V2",
    },
    body: JSON.stringify({
      body: message,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    // Log error but don't throw, as note creation might be less critical
    console.error(`Failed to create note in GHL: ${JSON.stringify(errorData)}`)
  }

  return response.ok ? response.json() : null;
}

// Helper function to trigger a workflow in GHL
async function triggerWorkflow(contactId: string) {
  if (!contactId || !GHL_CONTACT_FORM_WORKFLOW_ID || !GHL_API_BASE_URL || !GHL_API_KEY) {
    console.warn("Missing contactId, workflow ID, or GHL API credentials, skipping workflow trigger")
    return null
  }

  const response = await fetch(`${GHL_API_BASE_URL}/workflows/${GHL_CONTACT_FORM_WORKFLOW_ID}/trigger`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GHL_API_KEY}`,
      Version: "V2",
    },
    body: JSON.stringify({
      contactId: contactId,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.error(`Failed to trigger workflow in GHL: ${JSON.stringify(errorData)}`)
    // Don't throw error here, as this is optional
    return null
  }

  return response.json()
}

// Helper function to send email notification
async function sendEmailNotification(formData: any) {
  const { firstName, lastName, email, phone, subject, message, smsConsent } = formData;
  if (!process.env.RESEND_API_KEY || notificationEmailTo === 'your-receiving-email@example.com' || emailFrom === 'noreply@yourdomain.com') {
      console.warn("Resend API key or email addresses not configured, skipping email notification.");
      return { error: null }; // Indicate success in skipping
  }

  const { data, error } = await resend.emails.send({
      from: `Contact Form <${emailFrom}>`,
      to: [notificationEmailTo],
      subject: `New Contact Form Submission: ${subject}`,
      replyTo: email,
      html: `
        <h1>New Contact Form Submission</h1>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <p><strong>SMS Consent:</strong> ${smsConsent ? 'Yes' : 'No'}</p>
      `,
  });

  if (error) {
      console.error('Resend Error:', error);
      // Log error but don't throw, email might be secondary to GHL
      return { error }; 
  }
  console.log('Resend Success:', data);
  return { data, error: null };
}

export async function POST(request: Request) {
  let contactId: string | null = null;
  try {
    const data = await request.json()

    // Extract contact data from the form submission
    const { firstName, lastName, email, phone, subject, message, smsConsent } = data

    // Basic validation
    if (!firstName || !lastName || !email || !phone || !subject || !message) {
        return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Create contact in GHL
    const contactData = {
      firstName,
      lastName,
      email,
      phone,
      source: "Website Contact Form", // Add source
      tags: ["Website Lead"] // Add relevant tags
    }

    const contactResponse = await createContact(contactData);
    contactId = contactResponse.id; // Store contactId if created

    // Send Resend Email Notification (do this early in case GHL fails)
    const emailResult = await sendEmailNotification(data);
    // Optional: Handle email failure more gracefully if needed
    // if (emailResult.error) { /* ... maybe log but continue */ }

    // If contact was created in GHL, add note and trigger workflow
    if (contactId) {
        const noteContent = `Subject: ${subject}\n\nMessage: ${message}\n\nSMS Consent: ${smsConsent ? "Yes" : "No"}`
        await createNote(contactId, noteContent)
        await triggerWorkflow(contactId)
    }

    // Trigger specific Call Request Webhook (if subject indicates it, or always)
    // Example: Trigger if subject contains "Call Request"
    const triggerWebhook = subject.toLowerCase().includes("call request");
    if (triggerWebhook) {
        const callRequestWebhookUrl = "https://services.leadconnectorhq.com/hooks/oUvYNTw2Wvul7JSJplqQ/webhook-trigger/62fca39a-8d94-4813-b550-62027a30152b";
        try {
            const webhookPayload = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                phone: phone,
                subject: subject,
                message: message,
                contactId: contactId // Send GHL contact ID if useful
            };
            const webhookResponse = await fetch(callRequestWebhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(webhookPayload),
            });
            if (!webhookResponse.ok) {
                console.error(`Failed to send data to Call Request webhook: ${webhookResponse.status} ${await webhookResponse.text()}`);
            }
        } catch (webhookError) {
            console.error("Error sending data to Call Request webhook:", webhookError);
        }
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Contact form submitted successfully",
      contactId: contactId // Optionally return GHL contact ID
    })
  } catch (error) {
    console.error("Contact form API error:", error)
     if (error instanceof SyntaxError) {
        return NextResponse.json({ success: false, error: 'Invalid request format.' }, { status: 400 });
     }
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    )
  }
}
