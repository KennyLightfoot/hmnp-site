/**
 * Comprehensive GoHighLevel Management Utility
 * Provides functions to create and manage all GHL entities via API
 */

interface GHLApiConfig {
  baseUrl: string;
  privateIntegrationToken: string;
  version: string;
  locationId?: string;
}

const getGHLConfig = (): GHLApiConfig => {
  // Load environment variables dynamically to avoid module loading order issues
  const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL || "https://services.leadconnectorhq.com";
  const GHL_PRIVATE_INTEGRATION_TOKEN = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  const GHL_API_VERSION = "2021-07-28"; // FIXED: Use working API version
  const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

  if (!GHL_API_BASE_URL || !GHL_PRIVATE_INTEGRATION_TOKEN) {
    throw new Error('GHL Private Integration credentials missing in environment variables. Please set up Private Integration.');
  }
  
  return {
    baseUrl: GHL_API_BASE_URL,
    privateIntegrationToken: GHL_PRIVATE_INTEGRATION_TOKEN,
    version: GHL_API_VERSION,
    locationId: GHL_LOCATION_ID
  };
};

async function makeGHLRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: any) {
  const config = getGHLConfig();
  const url = `${config.baseUrl}${endpoint}`;

  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${config.privateIntegrationToken}`,
      'Content-Type': 'application/json',
      'Version': config.version,
      'User-Agent': 'HMNP-BookingSystem/1.0', // Added proper User-Agent
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`GHL API request failed (${response.status}): ${errorData}`);
  }

  if (response.status === 204) {
    return null;
  }

  return await response.json();
}

// ===== CUSTOM FIELDS MANAGEMENT =====

export interface CustomFieldDefinition {
  name: string;
  label: string;
  dataType: 'TEXT' | 'NUMERIC' | 'MONETARY' | 'DATE' | 'PHONE' | 'EMAIL' | 'URL' | 'DROPDOWN' | 'CHECKBOX' | 'MULTIPLE_OPTIONS' | 'FILE_UPLOAD';
  fieldType: 'SINGLE_LINE' | 'MULTIPLE_LINE' | 'NUMBER' | 'MONETARY' | 'DATE' | 'PHONE' | 'EMAIL' | 'URL' | 'DROPDOWN' | 'RADIO' | 'CHECKBOX' | 'MULTIPLE_SELECT' | 'FILE_UPLOAD';
  position?: number;
  placeholder?: string;
  isRequired?: boolean;
  group?: string;
  options?: string[]; // For dropdown/multi-select fields
}

export async function createCustomField(fieldData: CustomFieldDefinition) {
  const config = getGHLConfig();
  const endpoint = `/locations/${config.locationId}/customFields`;
  
  return await makeGHLRequest(endpoint, 'POST', fieldData);
}

export async function listCustomFields() {
  const config = getGHLConfig();
  const endpoint = `/locations/${config.locationId}/customFields`;
  
  return await makeGHLRequest(endpoint, 'GET');
}

export async function deleteCustomField(fieldId: string) {
  const config = getGHLConfig();
  const endpoint = `/locations/${config.locationId}/customFields/${fieldId}`;
  
  return await makeGHLRequest(endpoint, 'DELETE');
}

// ===== CONTACT MANAGEMENT =====

export interface ContactData {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  address1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  source?: string;
  tags?: string[];
  customFields?: Array<{
    id: string;
    field_value: string | number | boolean;
  }>;
}

export async function createContact(contactData: ContactData) {
  const config = getGHLConfig();
  const endpoint = `/contacts/`;
  
  const payload = {
    ...contactData,
    locationId: config.locationId
  };
  
  return await makeGHLRequest(endpoint, 'POST', payload);
}

export async function updateContact(contactId: string, contactData: Partial<ContactData>) {
  const endpoint = `/contacts/${contactId}`;
  return await makeGHLRequest(endpoint, 'PUT', contactData);
}

export async function searchContacts(query: string, locationId?: string) {
  const config = getGHLConfig();
  const queryParams = new URLSearchParams({
    query,
    ...(locationId || config.locationId ? { locationId: locationId || config.locationId! } : {})
  });
  
  const endpoint = `/contacts/search?${queryParams}`;
  return await makeGHLRequest(endpoint, 'GET');
}

export async function addContactTags(contactId: string, tags: string[]) {
  const endpoint = `/contacts/${contactId}/tags`;
  return await makeGHLRequest(endpoint, 'POST', { tags });
}

export async function removeContactTags(contactId: string, tags: string[]) {
  const endpoint = `/contacts/${contactId}/tags`;
  return await makeGHLRequest(endpoint, 'DELETE', { tags });
}

// ===== OPPORTUNITY MANAGEMENT =====

export interface OpportunityData {
  title: string;
  contactId: string;
  pipelineId: string;
  stageId: string;
  monetaryValue?: number;
  assignedTo?: string;
  status?: 'open' | 'won' | 'lost' | 'abandoned';
  source?: string;
  customFields?: Array<{
    id: string;
    field_value: string | number | boolean;
  }>;
}

export async function createOpportunity(opportunityData: OpportunityData) {
  const config = getGHLConfig();
  const endpoint = `/opportunities/`;
  
  const payload = {
    ...opportunityData,
    locationId: config.locationId
  };
  
  return await makeGHLRequest(endpoint, 'POST', payload);
}

export async function updateOpportunity(opportunityId: string, opportunityData: Partial<OpportunityData>) {
  const endpoint = `/opportunities/${opportunityId}`;
  return await makeGHLRequest(endpoint, 'PUT', opportunityData);
}

export async function moveOpportunityStage(opportunityId: string, stageId: string) {
  const endpoint = `/opportunities/${opportunityId}`;
  return await makeGHLRequest(endpoint, 'PUT', { stageId });
}

// ===== CALENDAR & APPOINTMENTS =====

export interface AppointmentData {
  calendarId: string;
  contactId: string;
  startTime: string; // ISO 8601 format
  endTime: string;
  title?: string;
  appointmentStatus?: 'confirmed' | 'cancelled' | 'showed' | 'noshow' | 'rescheduled';
  address?: string;
  ignoreDateRange?: boolean;
  toNotify?: boolean;
}

export async function createAppointment(appointmentData: AppointmentData) {
  const config = getGHLConfig();
  const endpoint = `/calendars/events/appointments`;
  
  const payload = {
    ...appointmentData,
    locationId: config.locationId
  };
  
  return await makeGHLRequest(endpoint, 'POST', payload);
}

/**
 * UPDATED: Get calendar slots using current GHL API best practices
 * This function now includes enhanced error handling and diagnostic information
 */
export async function getCalendarSlots(calendarId: string, startDate: string, endDate: string) {
  console.log(`🔍 Fetching slots for calendar ${calendarId} from ${startDate} to ${endDate}`);
  
  // Convert date strings to Unix timestamps for GHL API
  // The API expects UNIX timestamps as numbers, not date strings
  // Use proper timezone handling instead of hardcoded offset
  const startOfDay = new Date(`${startDate}T00:00:00`).getTime() / 1000;
  const endOfDay = new Date(`${endDate}T23:59:59`).getTime() / 1000;
  
  console.log(`📅 Converted to timestamps: ${startOfDay} to ${endOfDay}`);
  
  try {
    // APPROACH 1: Try the free-slots endpoint first (direct approach)
    // API expects UNIX timestamps as numbers per error message
    const queryParams = new URLSearchParams({
      startDate: startOfDay.toString(),
      endDate: endOfDay.toString(),
      timezone: 'America/Chicago'
    });
    
    const endpoint = `/calendars/${calendarId}/free-slots?${queryParams}`;
    console.log(`🔗 Trying endpoint: ${endpoint}`);
    
    const response = await makeGHLRequest(endpoint, 'GET');
    
    if (response && response.slots && response.slots.length > 0) {
      console.log(`✅ Found ${response.slots.length} slots using free-slots endpoint`);
      return response;
    }
    
    // Handle different response formats from GHL
    if (response && response.freeSlots && response.freeSlots.length > 0) {
      console.log(`✅ Found ${response.freeSlots.length} slots using freeSlots property`);
      return { slots: response.freeSlots, ...response };
    }
    
    if (response && Array.isArray(response) && response.length > 0) {
      console.log(`✅ Found ${response.length} slots in array format`);
      return { slots: response };
    }
    
    console.log(`⚠️  Free-slots endpoint returned no slots, trying diagnostic approach...`);
    
    // APPROACH 2: Get calendar details first to check configuration
    const calendarDetails = await makeGHLRequest(`/calendars/${calendarId}`, 'GET');
    
    if (!calendarDetails) {
      throw new Error(`Calendar ${calendarId} not found`);
    }
    
    // ADD DEBUG LOGGING TO UNDERSTAND RESPONSE STRUCTURE
    console.log(`🔍 RAW Calendar Response Structure:`, JSON.stringify(calendarDetails, null, 2));
    console.log(`🔍 Calendar Response Keys:`, Object.keys(calendarDetails));
    console.log(`🔍 Type of calendarDetails:`, typeof calendarDetails);
    
    // Check if response is wrapped in a 'calendar' property
    const calendar = calendarDetails.calendar || calendarDetails;
    
    console.log(`📋 Calendar Details Retrieved:`, {
      name: calendar.name,
      isActive: calendar.isActive,
      calendarType: calendar.calendarType,
      slotDuration: calendar.slotDuration,
      slotInterval: calendar.slotInterval,
      teamMembersCount: calendar.teamMembers?.length || 0,
      availabilitiesCount: calendar.availabilities?.length || 0,
      openHoursCount: calendar.openHours?.length || 0
    });
    
    // Check if calendar is properly configured - USE CORRECT OBJECT
    if (!calendar.isActive) {
      console.log(`❌ Calendar ${calendarId} is not active`);
      return { slots: [], error: 'Calendar is not active', calendarDetails };
    }
    
    if (!calendar.teamMembers || calendar.teamMembers.length === 0) {
      console.log(`❌ Calendar ${calendarId} has no team members assigned`);
      return { slots: [], error: 'Calendar has no team members assigned', calendarDetails };
    }
    
    // Check for Look Busy feature that might be hiding slots
    if (calendar.lookBusyConfig?.enabled) {
      console.log(`⚠️  Look Busy is enabled at ${calendar.lookBusyConfig.lookBusyPercentage}%`);
      if (calendar.lookBusyConfig.lookBusyPercentage >= 90) {
        console.log(`❌ Look Busy is set too high (${calendar.lookBusyConfig.lookBusyPercentage}%) - this may hide most slots`);
      }
    }
    
    // Check availability blocks
    if (!calendar.availabilities || calendar.availabilities.length === 0) {
      console.log(`❌ Calendar ${calendarId} has no availability blocks configured`);
      if (!calendar.openHours || calendar.openHours.length === 0) {
        console.log(`❌ Calendar ${calendarId} also has no open hours configured`);
        return { 
          slots: [], 
          error: 'Calendar has no availability blocks or open hours configured',
          calendarDetails,
          suggestion: 'Please configure availability blocks in your GHL calendar settings'
        };
      }
    }
    
    // Check minimum scheduling notice
    if (calendar.allowBookingAfter) {
      const minNoticeHours = calendar.allowBookingAfter;
      const minNoticeMs = minNoticeHours * 60 * 60 * 1000;
      const earliestBookingTime = new Date(Date.now() + minNoticeMs);
      const requestedStartTime = new Date(startOfDay * 1000);
      
      if (requestedStartTime < earliestBookingTime) {
        console.log(`⚠️  Requested date ${startDate} is within minimum scheduling notice (${minNoticeHours} hours)`);
        console.log(`   Earliest booking time: ${earliestBookingTime.toISOString()}`);
      }
    }
    
    // Check booking window
    if (calendar.allowBookingFor) {
      const maxAdvanceDays = calendar.allowBookingFor;
      const maxBookingTime = new Date(Date.now() + (maxAdvanceDays * 24 * 60 * 60 * 1000));
      const requestedEndTime = new Date(endOfDay * 1000);
      
      if (requestedEndTime > maxBookingTime) {
        console.log(`⚠️  Requested date ${endDate} is beyond booking window (${maxAdvanceDays} days)`);
        console.log(`   Latest booking time: ${maxBookingTime.toISOString()}`);
      }
    }
    
    // APPROACH 3: Try alternative endpoints if available
    console.log(`🔍 Attempting alternative availability checks...`);
    
    // Try with different timezone
    const alternativeParams = new URLSearchParams({
      startDate: startOfDay.toString(),
      endDate: endOfDay.toString(),
      timezone: 'UTC'
    });
    
    const alternativeEndpoint = `/calendars/${calendarId}/free-slots?${alternativeParams}`;
    const alternativeResponse = await makeGHLRequest(alternativeEndpoint, 'GET');
    
    if (alternativeResponse && (alternativeResponse.slots?.length > 0 || alternativeResponse.freeSlots?.length > 0)) {
      console.log(`✅ Found slots using UTC timezone`);
      return alternativeResponse.slots ? alternativeResponse : { slots: alternativeResponse.freeSlots || alternativeResponse };
    }
    
    // Generate available slots based on calendar configuration (fallback)
    const generatedSlots = generateAvailableSlots(calendar, startOfDay, endOfDay, []);
    
    console.log(`🔧 Generated ${generatedSlots.length} available slots based on calendar configuration`);
    
    return { 
      slots: generatedSlots,
      calendarDetails,
      source: 'generated',
      warning: 'Slots were generated based on calendar configuration - GHL API may have returned empty results'
    };
    
  } catch (error) {
    console.error(`❌ Error fetching calendar slots:`, error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Enhanced error reporting
    const errorDetails = {
      calendarId,
      requestedDate: startDate,
      endpoint: `/calendars/${calendarId}/free-slots`,
      error: errorMessage,
      timestamp: new Date().toISOString(),
      // Include common troubleshooting steps
      troubleshooting: [
        'Check if calendar is active in GHL dashboard',
        'Verify team member is assigned to calendar',
        'Ensure availability blocks are configured',
        'Check minimum scheduling notice settings',
        'Verify API permissions are enabled for calendar'
      ]
    };
    
    // Return empty slots with detailed error info instead of throwing
    return { 
      slots: [], 
      error: `Failed to fetch calendar slots: ${errorMessage}`,
      details: errorDetails
    };
  }
}

/**
 * Generate available slots based on calendar configuration
 */
function generateAvailableSlots(calendarDetails: any, startTimestamp: number, endTimestamp: number, existingEvents: any[]): any[] {
  const slots: any[] = [];
  
  // Use calendar's availability blocks and open hours
  const availabilities = calendarDetails.availabilities || [];
  const openHours = calendarDetails.openHours || [];
  const slotDuration = calendarDetails.slotDuration || 30; // Default 30 minutes
  
  // For each availability block, generate slots
  availabilities.forEach((availability: any) => {
    if (!availability.startTime || !availability.endTime) return;
    
    const blockStart = Math.max(availability.startTime, startTimestamp);
    const blockEnd = Math.min(availability.endTime, endTimestamp);
    
    // Generate slots every slotDuration minutes
    for (let slotStart = blockStart; slotStart < blockEnd; slotStart += (slotDuration * 60)) {
      const slotEnd = slotStart + (slotDuration * 60);
      
      // Check if slot conflicts with existing events
      const hasConflict = existingEvents.some((event: any) => {
        const eventStart = new Date(event.startTime).getTime() / 1000;
        const eventEnd = new Date(event.endTime).getTime() / 1000;
        
        return (slotStart < eventEnd && slotEnd > eventStart);
      });
      
      if (!hasConflict) {
        slots.push({
          startTime: slotStart,
          endTime: slotEnd,
          available: true,
          duration: slotDuration
        });
      }
    }
  });
  
  return slots;
}

export async function updateAppointment(appointmentId: string, appointmentData: Partial<AppointmentData>) {
  const endpoint = `/calendars/events/appointments/${appointmentId}`;
  return await makeGHLRequest(endpoint, 'PUT', appointmentData);
}

// ===== WORKFLOW MANAGEMENT =====

export async function addContactToWorkflow(contactId: string, workflowId: string) {
  const endpoint = `/contacts/${contactId}/workflow/${workflowId}`;
  return await makeGHLRequest(endpoint, 'POST', {});
}

export async function removeContactFromWorkflow(contactId: string, workflowId: string) {
  const endpoint = `/contacts/${contactId}/workflow/${workflowId}`;
  return await makeGHLRequest(endpoint, 'DELETE');
}

// ===== PIPELINE MANAGEMENT =====

export interface PipelineData {
  name: string;
  stages: Array<{
    name: string;
    position: number;
  }>;
}

export async function createPipeline(pipelineData: PipelineData) {
  const config = getGHLConfig();
  const endpoint = `/locations/${config.locationId}/pipelines`;
  
  return await makeGHLRequest(endpoint, 'POST', pipelineData);
}

export async function listPipelines() {
  const config = getGHLConfig();
  const endpoint = `/locations/${config.locationId}/pipelines`;
  
  return await makeGHLRequest(endpoint, 'GET');
}

// ===== COMMUNICATION =====

export interface SMSData {
  contactId: string;
  message: string;
  type?: 'SMS' | 'GMB';
  scheduledDate?: string;
}

export async function sendSMS(smsData: SMSData) {
  const config = getGHLConfig();
  const endpoint = `/conversations/messages`;
  
  const payload = {
    ...smsData,
    locationId: config.locationId
  };
  
  return await makeGHLRequest(endpoint, 'POST', payload);
}

export interface EmailData {
  contactId: string;
  subject: string;
  html: string;
  from?: string;
  scheduledDate?: string;
  attachments?: Array<{
    name: string;
    url: string;
  }>;
}

export async function sendEmail(emailData: EmailData) {
  const config = getGHLConfig();
  const endpoint = `/conversations/messages/email`;
  
  const payload = {
    ...emailData,
    locationId: config.locationId
  };
  
  return await makeGHLRequest(endpoint, 'POST', payload);
}

// ===== NOTES MANAGEMENT =====

export async function addContactNote(contactId: string, body: string, userId?: string) {
  const endpoint = `/contacts/${contactId}/notes`;
  
  const payload = {
    body,
    ...(userId ? { userId } : {})
  };
  
  return await makeGHLRequest(endpoint, 'POST', payload);
}

// ===== TASK MANAGEMENT =====

export interface TaskData {
  title: string;
  body?: string;
  contactId: string;
  dueDate: string;
  assignedTo?: string;
  completed?: boolean;
}

export async function createTask(taskData: TaskData) {
  const config = getGHLConfig();
  const endpoint = `/locations/${config.locationId}/tasks`;
  
  return await makeGHLRequest(endpoint, 'POST', taskData);
}

// ===== LOCATION MANAGEMENT =====

export async function getLocationInfo() {
  const config = getGHLConfig();
  const endpoint = `/locations/${config.locationId}`;
  
  return await makeGHLRequest(endpoint, 'GET');
}

// ===== COMPREHENSIVE BUSINESS WORKFLOWS =====

/**
 * Complete lead creation workflow
 */
export async function createCompleteNewLead(leadData: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  source: string;
  serviceInterest?: string;
  customFields?: Record<string, any>;
  pipelineId?: string;
  stageId?: string;
}) {
  try {
    // 1. Create contact
    const contact = await createContact({
      firstName: leadData.firstName,
      lastName: leadData.lastName,
      email: leadData.email,
      phone: leadData.phone,
      source: leadData.source,
      tags: ['Status:NewLead', `Source:${leadData.source}`],
      customFields: Object.entries(leadData.customFields || {}).map(([id, value]) => ({
        id,
        field_value: value
      }))
    });

    // 2. Create opportunity if pipeline info provided
    let opportunity = null;
    if (leadData.pipelineId && leadData.stageId) {
      opportunity = await createOpportunity({
        title: `${leadData.firstName} ${leadData.lastName} - ${leadData.serviceInterest || 'General Inquiry'}`,
        contactId: contact.id,
        pipelineId: leadData.pipelineId,
        stageId: leadData.stageId,
        source: leadData.source
      });
    }

    // 3. Add note about lead creation
    await addContactNote(
      contact.id,
      `New lead created via ${leadData.source}. Service interest: ${leadData.serviceInterest || 'Not specified'}`
    );

    return {
      contact,
      opportunity,
      success: true
    };

  } catch (error) {
    console.error('Error in createCompleteNewLead:', error);
    throw error;
  }
}

/**
 * Complete booking confirmation workflow
 */
export async function confirmBookingWorkflow(bookingData: {
  contactId: string;
  calendarId: string;
  scheduledDateTime: string;
  serviceType: string;
  numberOfSigners: number;
  serviceAddress: string;
  paymentAmount?: number;
  opportunityId?: string;
}) {
  try {
    // 1. Create appointment
    const appointment = await createAppointment({
      calendarId: bookingData.calendarId,
      contactId: bookingData.contactId,
      startTime: bookingData.scheduledDateTime,
      endTime: new Date(new Date(bookingData.scheduledDateTime).getTime() + 60 * 60 * 1000).toISOString(), // +1 hour
      title: `${bookingData.serviceType} - ${bookingData.numberOfSigners} signer(s)`,
      address: bookingData.serviceAddress,
      appointmentStatus: 'confirmed'
    });

    // 2. Update contact custom fields
    const customFieldUpdates = [
      { id: 'cf_last_booking_status', field_value: 'Confirmed' },
      { id: 'cf_booking_service_type', field_value: bookingData.serviceType },
      { id: 'cf_booking_number_of_signers', field_value: bookingData.numberOfSigners },
      { id: 'cf_booking_service_address', field_value: bookingData.serviceAddress }
    ];

    if (bookingData.paymentAmount) {
      customFieldUpdates.push(
        { id: 'cf_payment_amount_paid', field_value: bookingData.paymentAmount },
        { id: 'cf_payment_status', field_value: 'Deposit Paid' }
      );
    }

    await updateContact(bookingData.contactId, {
      customFields: customFieldUpdates
    });

    // 3. Update tags
    await addContactTags(bookingData.contactId, [
      'Status:BookingConfirmed',
      `service:${bookingData.serviceType.replace(/\s+/g, '')}`,
      ...(bookingData.paymentAmount ? ['Payment:DepositPaid'] : ['Payment:Pending'])
    ]);

    // 4. Move opportunity stage if provided
    if (bookingData.opportunityId) {
      // Note: You'll need to determine the correct stage ID for "Booking Confirmed"
      // await moveOpportunityStage(bookingData.opportunityId, 'confirmed_stage_id');
    }

    // 5. Add note
    await addContactNote(
      bookingData.contactId,
              `Booking confirmed for ${bookingData.scheduledDateTime}. service: ${bookingData.serviceType}, Location: ${bookingData.serviceAddress}`
    );

    return {
      appointment,
      success: true
    };

  } catch (error) {
    console.error('Error in confirmBookingWorkflow:', error);
    throw error;
  }
} 