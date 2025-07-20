/**
 * GHL Messaging Service
 * Handles sending messages through Go High Level
 */

export interface GHLMessage {
  type: 'sms' | 'email';
  templateId?: string;
  message?: string;
  subject?: string; // For emails
}

export interface GHLMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send a message through GHL
 */
export async function sendGHLMessage(
  contactId: string,
  message: GHLMessage
): Promise<GHLMessageResult> {
  try {
    if (!process.env.GHL_API_KEY || !process.env.GHL_API_BASE_URL) {
      console.warn('GHL API credentials not configured');
      return { success: false, error: 'GHL API not configured' };
    }

    const endpoint = message.type === 'sms' 
      ? `${process.env.GHL_API_BASE_URL}/conversations/messages`
      : `${process.env.GHL_API_BASE_URL}/conversations/messages`;

    const payload = message.type === 'sms' 
      ? {
          type: 'SMS',
          contactId,
          message: message.message || '',
        }
      : {
          type: 'Email',
          contactId,
          subject: message.subject || 'Notification',
          html: message.message || '',
        };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.GHL_API_KEY as string,
        'Version': '2021-07-28',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      return { 
        success: true, 
        messageId: data.id || data.messageId 
      };
    } else {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('GHL message send failed:', errorData);
      return { 
        success: false, 
        error: errorData.message || 'Failed to send message' 
      };
    }
  } catch (error) {
    console.error('GHL messaging error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Send SMS through GHL
 */
export async function sendGHLSMS(
  contactId: string, 
  message: string
): Promise<GHLMessageResult> {
  return sendGHLMessage(contactId, { type: 'sms', message });
}

/**
 * Send Email through GHL
 */
export async function sendGHLEmail(
  contactId: string, 
  subject: string,
  message: string
): Promise<GHLMessageResult> {
  return sendGHLMessage(contactId, { type: 'email', subject, message });
} 