import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import {
  getLocationCustomFields,
  getContactByEmail,
  upsertContact,
  addTagsToContact,
  GhlCustomField,
} from '@/lib/ghl';

const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
const GHL_CONTACT_FORM_WORKFLOW_ID = process.env.GHL_CONTACT_FORM_WORKFLOW_ID;

const resend = new Resend(process.env.RESEND_API_KEY);
const notificationEmailTo = process.env.CONTACT_FORM_RECEIVER_EMAIL || 'your-receiving-email@example.com';
const emailFrom = process.env.CONTACT_FORM_SENDER_EMAIL || 'noreply@yourdomain.com';

async function createNoteForGHL(contactId: string, message: string) {
  if (!contactId || !process.env.GHL_API_BASE_URL || !process.env.GHL_API_KEY) {
    console.warn("Missing contactId or GHL API credentials, skipping GHL note creation.");
    return null;
  }
  const response = await fetch(`${process.env.GHL_API_BASE_URL}/contacts/${contactId}/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GHL_API_KEY}`,
      Version: "2021-07-28",
    },
    body: JSON.stringify({
      body: message,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error(`Failed to create note in GHL: ${JSON.stringify(errorData)}`);
  }
  return response.ok ? response.json() : null;
}

async function triggerGHLWorkflow(contactId: string) {
  if (!contactId || !GHL_CONTACT_FORM_WORKFLOW_ID || !process.env.GHL_API_BASE_URL || !process.env.GHL_API_KEY) {
    console.warn("Missing contactId, workflow ID, or GHL API credentials, skipping workflow trigger");
    return null;
  }
  const url = `${process.env.GHL_API_BASE_URL}/contacts/${contactId}/workflow/${GHL_CONTACT_FORM_WORKFLOW_ID}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GHL_API_KEY}`,
      Version: "2021-07-28",
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error(`Failed to trigger workflow in GHL: ${JSON.stringify(errorData)}`);
  }
  return response.ok ? response.json() : null;
}

async function sendEmailNotification(formData: any) {
  const { firstName, lastName, email, phone, subject, message, smsConsent, preferredCallTime, callRequestReason } = formData;
  if (!process.env.RESEND_API_KEY || notificationEmailTo === 'your-receiving-email@example.com' || emailFrom === 'noreply@yourdomain.com') {
    console.warn("Resend API key or email addresses not configured, skipping email notification.");
    return { error: null };
  }
  const { data, error } = await resend.emails.send({
    from: `Contact Form <${emailFrom}>`,
    to: [notificationEmailTo],
    subject: `New Contact Form Submission: ${subject}`,
    reply_to: email,
    html: `
        <h1>New Contact Form Submission</h1>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
        <p><strong>SMS Consent:</strong> ${smsConsent ? "Yes" : "No"}</p>
        <p><strong>Preferred Call Time:</strong> ${preferredCallTime || 'N/A'}</p>
        <p><strong>Call Request Reason:</strong> ${callRequestReason || 'N/A'}</p>
      `,
  });
  if (error) {
    console.error("Error sending email notification:", error);
    return { error };
  }
  return { data };
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { firstName, lastName, email, phone, subject, message, smsConsent, preferredCallTime, callRequestReason, termsAccepted } = data;

    if (!firstName || !lastName || !email || !phone || !subject || !message || typeof termsAccepted !== 'boolean' || !termsAccepted) {
      return NextResponse.json({ success: false, message: 'Missing required fields or terms not accepted.' }, { status: 400 });
    }

    let ghlContactId: string | null = null;
    let allCustomFields: GhlCustomField[] = [];

    try {
      allCustomFields = await getLocationCustomFields(GHL_LOCATION_ID!) || [];
    } catch (error) {
      console.error("Failed to fetch GHL custom fields:", error);
    }

    const findCustomFieldId = (keyToSearch: string) => {
      const field = allCustomFields.find(cf => cf.key === keyToSearch);
      return field && field.id ? field.id : undefined;
    };

    const customFieldsPayload = [];
    const cfLeadSourceDetailId = findCustomFieldId("cf_lead_source_detail");
    if (cfLeadSourceDetailId) customFieldsPayload.push({ id: cfLeadSourceDetailId, value: "Website General Inquiry" });

    const cfSmsConsentId = findCustomFieldId("cf_consent_sms_communications");
    if (cfSmsConsentId) customFieldsPayload.push({ id: cfSmsConsentId, value: smsConsent });
    
    const cfTermsAcceptedId = findCustomFieldId("cf_consent_terms_conditions");
    if (cfTermsAcceptedId) customFieldsPayload.push({ id: cfTermsAcceptedId, value: termsAccepted });

    const cfPreferredCallTimeId = findCustomFieldId("cf_preferred_call_time");
    if (cfPreferredCallTimeId && preferredCallTime) customFieldsPayload.push({ id: cfPreferredCallTimeId, value: preferredCallTime });

    const cfCallRequestNotesId = findCustomFieldId("cf_call_request_notes"); 
    if (cfCallRequestNotesId && callRequestReason) customFieldsPayload.push({ id: cfCallRequestNotesId, value: callRequestReason });

    const contactPayload: any = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: phone,
      locationId: GHL_LOCATION_ID, 
      source: "Website Contact Form",
      customField: customFieldsPayload.length > 0 ? customFieldsPayload : undefined, 
    };

    try {
      const existingContact = await getContactByEmail(email);
      if (existingContact && existingContact.id) {
        ghlContactId = existingContact.id;
        contactPayload.id = ghlContactId; 
        await upsertContact(contactPayload); 
        console.log(`Successfully updated existing GHL contact: ${ghlContactId}`);
      } else {
        const newContact = await upsertContact(contactPayload); 
        if (newContact && newContact.contact?.id) {
            ghlContactId = newContact.contact.id;
            console.log(`Successfully created new GHL contact: ${ghlContactId}`);
        } else if (newContact?.id) { 
            ghlContactId = newContact.id;
            console.log(`Successfully created new GHL contact (alt structure): ${ghlContactId}`);
        } else {
            console.error("Failed to get ID from new GHL contact response", newContact);
            throw new Error("Failed to create GHL contact or retrieve ID.");
        }
      }
    } catch (ghlError) {
      console.error("Error during GHL contact creation/update:", ghlError);
    }

    await sendEmailNotification(data);

    if (ghlContactId) {
      try {
        await addTagsToContact(ghlContactId, ["Source:Website_Contact_Form", "Lead_Status:New_Inquiry"]);
        const noteContent = `Subject: ${subject}\n\nMessage: ${message}\n\nSMS Consent: ${smsConsent ? "Yes" : "No"}\nPreferred Call Time: ${preferredCallTime || 'N/A'}\nCall Request Reason: ${callRequestReason || 'N/A'}`;
        await createNoteForGHL(ghlContactId, noteContent);
        await triggerGHLWorkflow(ghlContactId);
      } catch (postContactCreationError) {
        console.error("Error in post-contact creation GHL steps (tags, note, workflow):", postContactCreationError);
      }
    }

    const triggerCallWebhook = subject.toLowerCase().includes("call request");
    if (triggerCallWebhook) {
      const callRequestWebhookUrl = "https://services.leadconnectorhq.com/hooks/oUvYNTw2Wvul7JSJplqQ/webhook-trigger/49d653ab-1418-4c4e-aeab-85f12b11570c";
      try {
        const webhookPayload = {
          firstName, lastName, email, phone, subject, message,
          contactId: ghlContactId 
        };
        const webhookResponse = await fetch(callRequestWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookPayload),
        });
        if (!webhookResponse.ok) {
          console.error(`Failed to send data to Call Request webhook: ${webhookResponse.status} ${await webhookResponse.text()}`);
        }
      } catch (webhookError) {
        console.error("Error sending data to Call Request webhook:", webhookError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Contact form submitted successfully",
      contactId: ghlContactId
    });

  } catch (error) {
    console.error("Contact form API error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: error instanceof SyntaxError ? 400 : 500 }
    );
  }
}
