interface SmsArgs {
  to: string;
  body: string;
}

interface GhlSmsResponse {
  // Define the expected response structure from GHL API
  // For example:
  // success: boolean;
  // messageId?: string;
  // error?: string;
}

interface GhlSmsApiResponse {
  success: boolean;
  messageId?: string; // Will be populated from GHL response 'id' on success
  error?: string;     // A concise error message for failures
  details?: any;      // Detailed error information from GHL or fetch operation
}

/**
 * Sends an SMS using the GHL API.
 *
 * @param to The recipient's phone number.
 * @param body The content of the SMS.
 * @returns A promise that resolves with the GHL API response.
 */
export async function sendSms({ to, body }: SmsArgs): Promise<GhlSmsApiResponse> {
  const GHL_API_KEY = process.env.GHL_API_KEY;
  // It's good practice to use a specific, descriptive name for the SMS endpoint.
  const GHL_CONVERSATIONS_API_ENDPOINT = process.env.GHL_SMS_ENDPOINT || 'https://services.leadconnectorhq.com/conversations/messages';
  const GHL_API_VERSION = process.env.GHL_API_VERSION || '2021-04-15';
  const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

  if (!GHL_API_KEY) {
    console.error('GHL API key (GHL_API_KEY) is not configured.');
    return { success: false, error: 'GHL API key not configured' };
  }
  if (!GHL_LOCATION_ID) {
    console.error('GHL Location ID (GHL_LOCATION_ID) is not configured.');
    return { success: false, error: 'GHL Location ID not configured' };
  }
  if (!GHL_CONVERSATIONS_API_ENDPOINT) { // Should not happen with default
    console.error('GHL SMS endpoint (GHL_SMS_ENDPOINT) is not configured.');
    return { success: false, error: 'GHL SMS endpoint not configured' };
  }

  const payload = {
    type: 'SMS',
    // GHL API prefers contactId, but allows phoneNumber to link/create contact.
    // If you have contactId, it's better to use it:
    // contactId: ghlContactId, 
    phoneNumber: to,
    message: body,
    locationId: GHL_LOCATION_ID,
  };

  try {
    console.log(`Attempting to send SMS via GHL to ${to} using location ${GHL_LOCATION_ID}`);
    const response = await fetch(GHL_CONVERSATIONS_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Version': GHL_API_VERSION,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // If parsing error response fails, use status text
        errorData = { message: response.statusText };
      }
      console.error('Failed to send SMS via GHL:', response.status, errorData);
      return { 
        success: false, 
        error: `GHL API Error: ${errorData.message || response.statusText}`,
        details: errorData 
      };
    }

    const responseData = await response.json();
    // Successfully sent or queued by GHL
    // Example GHL success response: { "id": "...", "status": "queued", ... }
    console.log('SMS sent successfully via GHL:', responseData);
    return { 
      success: true, 
      messageId: responseData.id || responseData.messageId, // GHL uses 'id' for message
      details: responseData 
    };

  } catch (error: any) {
    console.error('Error calling GHL SMS API:', error);
    return { 
      success: false, 
      error: 'Failed to make request to GHL SMS API.', 
      details: error.message 
    };
  }
}

/**
 * Checks if the user has consented to receive SMS messages by looking for a specific tag in GHL.
 * This function assumes that the consent status is managed by a tag in GHL.
 *
 * @param email The email address of the user to check. Used to retrieve the GHL contact.
 * @returns A promise that resolves to true if the user has consented (tag found), false otherwise.
 */
export async function checkSmsConsent(email: string): Promise<boolean> {
  const GHL_SMS_CONSENT_TAG = process.env.GHL_SMS_CONSENT_TAG || 'Consent:SMS_Opt_In';

  if (!email) {
    console.warn('checkSmsConsent: Email is required to check SMS consent.');
    return false;
  }

  try {
    // Dynamically import ghl functions to avoid circular dependencies if sms.ts is imported by ghl.ts
    // and to ensure ghl.ts is loaded when this function is called.
    const ghl = await import('@/lib/ghl'); 
    
    console.log(`Checking SMS consent for email: ${email} using tag: ${GHL_SMS_CONSENT_TAG}`);
    const contact = await ghl.getContactByEmail(email);

    if (contact && contact.tags && Array.isArray(contact.tags)) {
      const hasConsent = contact.tags.includes(GHL_SMS_CONSENT_TAG);
      if (hasConsent) {
        console.log(`SMS consent confirmed for ${email}. Tag '${GHL_SMS_CONSENT_TAG}' found.`);
        return true;
      } else {
        console.log(`SMS consent NOT found for ${email}. Tag '${GHL_SMS_CONSENT_TAG}' missing. Tags:`, contact.tags);
        return false;
      }
    } else {
      console.log(`No GHL contact found for email ${email}, or contact has no tags. Assuming no consent.`);
      if (contact && (!contact.tags || !Array.isArray(contact.tags))) {
        console.log(`Contact found but tags are missing or not an array:`, contact.tags);
      }
      return false;
    }
  } catch (error: any) {
    console.error(`Error checking SMS consent for ${email}: ${error.message}`, error);
    // In case of error (e.g., GHL API down), default to no consent to be safe.
    return false;
  }
}

// Example of a more specific SMS function, e.g., for appointment reminders
interface AppointmentReminderSmsArgs {
  to: string;
  customerName: string;
  appointmentTime: string;
  appointmentDate: string;
  locationName: string;
}

export async function sendAppointmentReminderSms({
  to,
  customerName,
  appointmentDate,
  appointmentTime,
  locationName,
}: AppointmentReminderSmsArgs): Promise<GhlSmsApiResponse> {
  const body = `Hi ${customerName}, this is a reminder for your notary appointment at ${locationName} on ${appointmentDate} at ${appointmentTime}. Reply STOP to unsubscribe.`;
  
  // For now, we'll assume all users have consented for testing.
  // In a real application, you must check consent *before* sending.
  // const hasConsented = await checkSmsConsent(contactId); // Assuming you have a contactId or userId
  // if (!hasConsented) {
  //   console.log(`User ${contactId} has not consented to SMS. Aborting reminder.`);
  //   return { success: false, error: 'User has not consented to SMS' };
  // }

  return sendSms({ to, body });
} 