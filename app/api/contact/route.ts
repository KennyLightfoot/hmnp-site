import { Resend } from 'resend';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getLocationCustomFields, upsertContact, GhlCustomField, getCleanLocationId } from '@/lib/ghl';
import { findContactByEmail, addTagsToContact } from '@/lib/ghl/contacts';
import { withRateLimit } from '@/lib/security/rate-limiting';
import { z } from 'zod';

const GHL_CONTACT_FORM_WORKFLOW_ID = process.env.GHL_CONTACT_FORM_WORKFLOW_ID;

// Safely instantiate Resend only when API key is present
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null as unknown as InstanceType<typeof Resend>;

// Email configuration with proper validation
const CONTACT_FORM_CONFIG = {
  receiverEmail: process.env.CONTACT_FORM_RECEIVER_EMAIL?.trim(),
  senderEmail: process.env.CONTACT_FORM_SENDER_EMAIL?.trim(),
  resendApiKey: process.env.RESEND_API_KEY?.trim()
};

// Validate email configuration
if (!CONTACT_FORM_CONFIG.receiverEmail) {
  console.error('❌ CONTACT_FORM_RECEIVER_EMAIL environment variable is required');
}
if (!CONTACT_FORM_CONFIG.senderEmail) {
  console.error('❌ CONTACT_FORM_SENDER_EMAIL environment variable is required');
}
if (!CONTACT_FORM_CONFIG.resendApiKey) {
  console.warn('⚠️ RESEND_API_KEY not configured - contact form emails will not be sent');
}

// Validate email formats
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (CONTACT_FORM_CONFIG.receiverEmail && !emailRegex.test(CONTACT_FORM_CONFIG.receiverEmail)) {
  console.error('❌ CONTACT_FORM_RECEIVER_EMAIL has invalid format:', CONTACT_FORM_CONFIG.receiverEmail);
}
if (CONTACT_FORM_CONFIG.senderEmail && !emailRegex.test(CONTACT_FORM_CONFIG.senderEmail)) {
  console.error('❌ CONTACT_FORM_SENDER_EMAIL has invalid format:', CONTACT_FORM_CONFIG.senderEmail);
}

const notificationEmailTo = CONTACT_FORM_CONFIG.receiverEmail || 'your-receiving-email@example.com';
const emailFrom = CONTACT_FORM_CONFIG.senderEmail || 'noreply@yourdomain.com';

async function createNoteForGHL(contactId: string, message: string) {
  const apiKey = process.env.GHL_PRIVATE_INTEGRATION_TOKEN || process.env.GHL_API_KEY;
  if (!contactId || !process.env.GHL_API_BASE_URL || !apiKey) {
    console.warn("Missing contactId or GHL API credentials, skipping GHL note creation.");
    return null;
  }
  const response = await fetch(`${process.env.GHL_API_BASE_URL}/contacts/${contactId}/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
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
  const apiKey = process.env.GHL_PRIVATE_INTEGRATION_TOKEN || process.env.GHL_API_KEY;
  if (!contactId || !GHL_CONTACT_FORM_WORKFLOW_ID || !process.env.GHL_API_BASE_URL || !apiKey) {
    console.warn("Missing contactId, workflow ID, or GHL API credentials, skipping workflow trigger");
    return null;
  }
  const url = `${process.env.GHL_API_BASE_URL}/contacts/${contactId}/workflow/${GHL_CONTACT_FORM_WORKFLOW_ID}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
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
  if (!CONTACT_FORM_CONFIG.resendApiKey || notificationEmailTo === 'your-receiving-email@example.com' || emailFrom === 'noreply@yourdomain.com') {
    console.warn("Resend API key or email addresses not configured, skipping email notification.");
    return { error: null };
  }
  if (!resend) {
    console.warn('Resend not configured - skipping email send');
    return { error: 'Resend not configured' };
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
        <p>${message.replace(/\n/g, "<br>")}</p>
        <p><strong>SMS Consent:</strong> ${smsConsent ? "Yes" : "No"}</p>
        <p><strong>Preferred Call Time:</strong> ${preferredCallTime || 'N/A'}</p>
        <p><strong>Call Request Reason:</strong> ${callRequestReason || 'N/A'}</p>
      `,
  });
  if (error) {
    console.error("Error sending email notification:", getErrorMessage(error));
    return { error };
  }
  return { data };
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withRateLimit('public', 'contact_form')(async (request: Request) => {
  try {
    const rawData = await request.json();
    
    // Enhanced validation patterns
    const PHONE_REGEX = /^\+?1?[2-9]\d{2}[2-9]\d{2}\d{4}$/; // US phone number format
    const NAME_REGEX = /^[a-zA-Z\s\-'\.]{1,50}$/; // Names with common characters
    const SUBJECT_REGEX = /^[a-zA-Z0-9\s\-_,.\?!]{1,150}$/; // Subject line allowed chars
    const MESSAGE_REGEX = /^[\s\S]{1,2000}$/; // Message content (any printable chars)
    // Accept common phrases ("any time", "anytime") or formatted times like "3:30 PM"
    const TIME_REGEX = /^(morning|afternoon|evening|any\s?time|[0-9]{1,2}:[0-9]{2}\s?(AM|PM|am|pm))$/i;

    const contactFormSchema = z.object({
      firstName: z
        .string()
        .trim()
        .min(1, 'First name is required')
        .max(50, 'First name must be 50 characters or less')
        .regex(NAME_REGEX, 'First name contains invalid characters'),
      lastName: z
        .string()
        .trim()
        .min(1, 'Last name is required')
        .max(50, 'Last name must be 50 characters or less')
        .regex(NAME_REGEX, 'Last name contains invalid characters'),
      email: z
        .string()
        .trim()
        .min(1, 'Email address is required')
        .email('Please enter a valid email address')
        .max(254, 'Email address is too long')
        .refine((email) => !email.includes('..'), 'Email address format is invalid')
        .refine((email) => !email.startsWith('.') && !email.endsWith('.'), 'Email address format is invalid'),
      phone: z
        .string()
        .trim()
        .min(1, 'Phone number is required')
        .regex(PHONE_REGEX, 'Please enter a valid US phone number (e.g., 555-123-4567)')
        .transform((phone) => phone.replace(/\D/g, '')) // Strip non-digits for storage
        .refine((phone) => phone.length === 10 || phone.length === 11, 'Phone number must be 10 or 11 digits'),
      subject: z
        .string()
        .trim()
        .min(1, 'Subject is required')
        .max(150, 'Subject must be 150 characters or less')
        .regex(SUBJECT_REGEX, 'Subject contains invalid characters'),
      message: z
        .string()
        .trim()
        .min(10, 'Message must be at least 10 characters')
        .max(2000, 'Message must be 2000 characters or less')
        .regex(MESSAGE_REGEX, 'Message contains invalid characters'),
      smsConsent: z.boolean().default(false),
      preferredCallTime: z
        .string()
        .trim()
        .max(100, 'Preferred call time is too long')
        .optional(),
      callRequestReason: z
        .string()
        .trim()
        .max(500, 'Call request reason must be 500 characters or less')
        .optional()
        .or(z.literal('')),
      termsAccepted: z.boolean().refine((val) => val === true, {
        message: 'You must accept the terms and conditions to proceed',
      }),
    });

    const data = contactFormSchema.parse(rawData);
    const { firstName, lastName, email, phone, subject, message, smsConsent, preferredCallTime, callRequestReason, termsAccepted } = data;

    let ghlContactId: string | null = null;
    let allCustomFields: GhlCustomField[] = [];

    try {
      allCustomFields = await getLocationCustomFields(getCleanLocationId()) || [];
    } catch (error) {
      console.error("Failed to fetch GHL custom fields:", getErrorMessage(error));
    }

    const findCustomFieldId = (keyToSearch: string) => {
      const field = allCustomFields.find(cf => cf.key === keyToSearch);
      return field && field.id ? field.id : undefined;
    };

    const customFieldsPayload = [];
    const cfLeadSourceDetailId = findCustomFieldId("cf_lead_source_detail");
    if (cfLeadSourceDetailId) customFieldsPayload.push({ id: cfLeadSourceDetailId, field_value: "Website General Inquiry" });

    const cfSmsConsentId = findCustomFieldId("cf_consent_sms_communications");
    if (cfSmsConsentId) customFieldsPayload.push({ id: cfSmsConsentId, field_value: smsConsent });
    
    const cfTermsAcceptedId = findCustomFieldId("cf_consent_terms_conditions");
    if (cfTermsAcceptedId) customFieldsPayload.push({ id: cfTermsAcceptedId, field_value: termsAccepted });

    const cfPreferredCallTimeId = findCustomFieldId("cf_preferred_call_time");
    if (cfPreferredCallTimeId && preferredCallTime) customFieldsPayload.push({ id: cfPreferredCallTimeId, field_value: preferredCallTime });

    const cfCallRequestNotesId = findCustomFieldId("cf_call_request_notes"); 
    if (cfCallRequestNotesId && callRequestReason) customFieldsPayload.push({ id: cfCallRequestNotesId, field_value: callRequestReason });

    const contactPayload: any = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: phone,
      locationId: getCleanLocationId(), 
      source: "Website Contact Form",
      customField: customFieldsPayload.length > 0 ? customFieldsPayload : undefined, 
    };

    try {
      const existingContact = await findContactByEmail(email);
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

    // Track conversation history
    try {
      const { ConversationTracker } = await import('@/lib/conversation-tracker');
      const headersList = await headers();
      
      await ConversationTracker.trackContactForm({
        customerEmail: email,
        customerName: `${firstName} ${lastName}`,
        subject: subject,
        message: message,
        phone: phone,
        metadata: {
          smsConsent,
          preferredCallTime,
          callRequestReason,
          termsAccepted,
          ghlContactId,
          ipAddress: headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown',
          userAgent: headersList.get('user-agent') || 'unknown'
        }
      });
      
      console.log('📝 Contact form conversation tracked successfully');
    } catch (trackingError) {
      console.error('⚠️  Contact form tracking failed (non-blocking):', trackingError);
    }

    if (ghlContactId) {
      try {
        const tags = ["Source:Website_Contact_Form", "Lead_Status:New_Inquiry"]
        if (smsConsent) {
          tags.push(process.env.GHL_SMS_CONSENT_TAG || 'Consent:SMS_OptIn')
        }
        await addTagsToContact(ghlContactId, tags);
        const noteContent = `Subject: ${subject}\n\nMessage: ${message}\n\nSMS Consent: ${smsConsent ? "Yes" : "No"}\nPreferred Call Time: ${preferredCallTime || 'N/A'}\nCall Request Reason: ${callRequestReason || 'N/A'}`;
        await createNoteForGHL(ghlContactId, noteContent);
        await triggerGHLWorkflow(ghlContactId);
      } catch (postContactCreationError) {
        console.error("Error in post-contact creation GHL steps (tags, note, workflow):", postContactCreationError);
      }
    }

    const triggerCallWebhook = subject.toLowerCase().includes("call request");
    if (triggerCallWebhook) {
      const callRequestWebhookUrl = process.env.GHL_CALL_REQUEST_WEBHOOK_URL;
      if (!callRequestWebhookUrl) {
        console.warn("GHL_CALL_REQUEST_WEBHOOK_URL not configured, skipping call request webhook");
        return NextResponse.json({
          success: true,
          message: "Contact form submitted successfully",
          contactId: ghlContactId
        });
      }
      
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
    console.error("Contact form API error:", getErrorMessage(error));
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }
    
    const errorMessage = error instanceof Error ? getErrorMessage(error) : "An unknown error occurred";
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: error instanceof SyntaxError ? 400 : 500 }
    );
  }
});
