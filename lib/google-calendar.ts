import { google } from 'googleapis';
import { BookingStatus } from '@prisma/client';

export class GoogleCalendarService {
  private calendar;
  private static instance: GoogleCalendarService;
  
  constructor() {
    let auth;
    
    // Check if we have JSON content as environment variable (production)
    if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      try {
        let jsonString = process.env.GOOGLE_SERVICE_ACCOUNT_JSON.trim();
        if (!jsonString) {
          throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is empty');
        }
        
        // Remove outer quotes if they exist (common in environment variables)
        if (jsonString.startsWith('"') && jsonString.endsWith('"')) {
          jsonString = jsonString.slice(1, -1);
        }
        
        const credentials = JSON.parse(jsonString);
        // Fix private key newlines
        credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
        
        auth = new google.auth.GoogleAuth({
          credentials,
          scopes: ['https://www.googleapis.com/auth/calendar'],
        });
      } catch (error) {
        console.error('Error parsing GOOGLE_SERVICE_ACCOUNT_JSON:', error);
        throw new Error('Invalid Google service account JSON in environment variable');
      }
    } 
    // Otherwise use key file (local development)
    else if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });
    } 
    // No credentials provided
    else {
      throw new Error('Google Calendar credentials not found. Please set GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_SERVICE_ACCOUNT_KEY environment variable.');
    }
    
    this.calendar = google.calendar({ version: 'v3', auth });
  }

  // Lazy loading pattern to avoid instantiation during build
  public static getInstance(): GoogleCalendarService {
    if (!GoogleCalendarService.instance) {
      GoogleCalendarService.instance = new GoogleCalendarService();
    }
    return GoogleCalendarService.instance;
  }
  
  async createBookingEvent(booking: any, conversationHistory?: any, notaryInfo?: any) {
    try {
      const customerName = booking.User_Booking_signerIdToUser?.name || booking.customerName || 'Guest';
      const serviceName = booking.Service.name || booking.serviceName;
      
      const event = {
        summary: `${serviceName} - ${customerName}`,
        location: booking.addressStreet ? 
          `${booking.addressStreet}, ${booking.addressCity}, ${booking.addressState} ${booking.addressZip}` : 
          'Remote/Online Service',
        description: this.formatEventDescription(booking, conversationHistory, notaryInfo),
        start: {
          dateTime: booking.scheduledDateTime.toISOString(),
          timeZone: 'America/Chicago',
        },
        end: {
          dateTime: new Date(booking.scheduledDateTime.getTime() + (booking.Service.durationMinutes * 60000)).toISOString(),
          timeZone: 'America/Chicago',
        },
        colorId: this.getEventColor(booking.status),
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 120 },
            { method: 'email', minutes: 1440 }, // 24 hours
            { method: 'popup', minutes: 30 }, // 30 minutes before
          ],
        },
        // Add attendees
        attendees: [
          // {
          //   email: booking.User_Booking_signerIdToUser?.email || booking.customerEmail,
          //   displayName: customerName,
          //   responseStatus: 'accepted'
          // },
          ...(notaryInfo?.email ? [{
            email: notaryInfo.email,
            displayName: notaryInfo.name || 'Houston Mobile Notary',
            responseStatus: 'accepted'
          }] : [])
        ],
        // For RON services, only include the notary as an attendee to prevent sending invites to the client.
        ...(booking.Service.serviceType === 'RON_SERVICES' && {
          attendees: notaryInfo?.email ? [{
            email: notaryInfo.email,
            displayName: notaryInfo.name || 'Houston Mobile Notary',
            responseStatus: 'accepted'
          }] : [],
        }),
        // Conditionally add conference data for RON services, but only if a valid session URL exists.
        ...(booking.Service.serviceType === 'RON_SERVICES' && booking.proofSessionUrl && {
          conferenceData: {
            createRequest: {
              requestId: `ron-${booking.id}`,
              conferenceSolutionKey: {
                type: 'addOn'
              },
            },
            entryPoints: [{
              entryPointType: 'video',
              uri: booking.proofSessionUrl,
              label: 'Join RON Session'
            }]
          }
        }),
        // For RON services, do not create a Google Meet link.
        // Instead, add a note to the description that the invite comes from Proof.com.
        ...(!booking.proofSessionUrl && booking.Service.serviceType === 'RON_SERVICES' && {
          conferenceData: {
            notes: "The client will receive a separate meeting invitation from Proof.com. This calendar event is for scheduling purposes only."
          }
        })
      };
      
      if (!process.env.GOOGLE_CALENDAR_ID) {
        throw new Error('GOOGLE_CALENDAR_ID environment variable is required');
      }
      
      const response = await this.calendar.events.insert({
        calendarId: process.env.GOOGLE_CALENDAR_ID,
        requestBody: event,
        conferenceDataVersion: 1, // This must be set to 1 to process conference data
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating Google Calendar event:', error);
      throw error;
    }
  }
  
  private formatEventDescription(booking: any, conversationHistory?: any, notaryInfo?: any): string {
    const serviceType = booking.Service.serviceType || booking.serviceType;
    
    // Add Proof.com URL to description for RON services
    const ronDetails = serviceType === 'RON_SERVICES' && booking.proofSessionUrl ? `
🔗 RON SESSION LINK
===================
Join your secure session: ${booking.proofSessionUrl}
` : '';

    // Get service-specific preparation instructions
    const preparationInstructions = this.getServicePreparationInstructions(serviceType);
    const documentRequirements = this.getDocumentRequirements(serviceType);
    const idRequirements = this.getIdRequirements(serviceType);

    let description = `
📋 APPOINTMENT DETAILS
===================${ronDetails}
Service: ${booking.Service.name}
Service Type: ${serviceType}
Booking ID: ${booking.id}
Customer: ${booking.User_Booking_signerIdToUser?.name || booking.customerName || 'Guest'}
Phone: ${booking.User_Booking_signerIdToUser?.phone || booking.customerPhone || 'Not provided'}
Email: ${booking.User_Booking_signerIdToUser?.email || booking.customerEmail}
Payment Status: ${booking.status}
Amount: $${booking.priceAtBooking}
Number of Signers: ${booking.numberOfSigners || 1}
Number of Documents: ${booking.numberOfDocuments || 1}
${booking.notes ? `Notes: ${booking.notes}` : ''}
${booking.specialInstructions ? `Special Instructions: ${booking.specialInstructions}` : ''}
${booking.locationNotes ? `Location Notes: ${booking.locationNotes}` : ''}

📍 LOCATION INFORMATION
====================
${booking.addressStreet ? `Address: ${booking.addressStreet}, ${booking.addressCity}, ${booking.addressState} ${booking.addressZip}` : 'Address: TBD'}
${booking.locationNotes ? `Location Notes: ${booking.locationNotes}` : ''}

👤 NOTARY INFORMATION
==================
${notaryInfo ? `
Name: ${notaryInfo.name || 'Will be assigned 24 hours before appointment'}
Phone: ${notaryInfo.phone || 'TBD'}
Email: ${notaryInfo.email || 'TBD'}
Commission #: ${notaryInfo.commissionNumber || 'TBD'}
Estimated Arrival: ${notaryInfo.estimatedArrival || 'TBD'}
` : 'Notary will be assigned 24 hours before appointment'}

`;

    // Add conversation history if available
    if (conversationHistory) {
      description += `
💬 SERVICE CONTEXT
================
`;
      if (conversationHistory.initialInquiry) {
        description += `Initial Request: "${conversationHistory.initialInquiry}"\n`;
      }
      if (conversationHistory.serviceRequests?.length) {
        description += `Service Requirements:\n`;
        conversationHistory.serviceRequests.forEach((req: string) => {
          description += `  • ${req}\n`;
        });
      }
      if (conversationHistory.specialNeeds?.length) {
        description += `Special Accommodations:\n`;
        conversationHistory.specialNeeds.forEach((need: string) => {
          description += `  • ${need}\n`;
        });
      }
      if (conversationHistory.previousInteractions?.length) {
        description += `Previous Interactions:\n`;
        conversationHistory.previousInteractions.forEach((interaction: any) => {
          description += `  • ${interaction.date} - ${interaction.type}: ${interaction.summary}\n`;
        });
      }
    }

    // Add preparation instructions
    description += `
📝 PREPARATION INSTRUCTIONS
=========================
✅ Required Documentation:
`;
    documentRequirements.forEach((req: string) => {
      description += `  • ${req}\n`;
    });

    description += `
🆔 Acceptable Forms of ID:
`;
    idRequirements.forEach((req: string) => {
      description += `  • ${req}\n`;
    });

    description += `
🎯 Service-Specific Instructions:
`;
    preparationInstructions.forEach((instruction: string) => {
      description += `  • ${instruction}\n`;
    });

    description += `
⚠️ IMPORTANT REMINDERS
====================
• Arrive 5 minutes early to allow time for setup
• All signers must be present with valid ID
• Documents must be complete before notarization
• No changes allowed to documents during notarization
${booking.witnessRequired ? '• Witness required - Please have your witness present' : ''}

📞 CONTACT INFORMATION
====================
Houston Mobile Notary Pros
Phone: (832) 617-4285
Email: support@houstonmobilenotarypros.com
Website: https://houstonmobilenotarypros.com
`;

    return description.trim();
  }

  private getServicePreparationInstructions(serviceType: string): string[] {
    const instructions = {
      'QUICK_STAMP_LOCAL': [
        'Document should be printed and ready for signing',
        'Ensure all information is accurate before arrival',
        'Have a flat surface available for signing'
      ],
      'STANDARD_NOTARY': [
        'Review all documents before our arrival',
        'Ensure all signers will be present',
        'Have a quiet, well-lit space ready',
        'Prepare any questions you may have'
      ],
      'EXTENDED_HOURS': [
        'Confirm appointment time via text/call',
        'Ensure location is accessible after hours',
        'Have exterior lighting if evening appointment',
        'Consider neighbors for evening appointments'
      ],
      'LOAN_SIGNING': [
        'Review loan documents in advance if possible',
        'Ensure all borrowers will be present',
        'Have wire transfer information ready',
        'Prepare questions about loan terms',
        'Allow 90-120 minutes for full signing',
        'Clear large table space for documents'
      ],
      'RON_SERVICES': [
        'Test your camera and microphone',
        'Ensure stable internet connection',
        'Have good lighting for ID verification',
        'Download any required software',
        'Be in a quiet, private space',
        'Have documents ready for upload'
      ],
      'BUSINESS_ESSENTIALS': [
        'Prepare all business documents',
        'Have corporate seal if applicable',
        'Ensure authorized signers are present',
        'Review corporate resolutions'
      ],
      'BUSINESS_GROWTH': [
        'Prepare comprehensive document package',
        'Have all corporate documentation ready',
        'Ensure board resolutions are current',
        'Prepare for multiple document review'
      ]
    };

    return instructions[serviceType as keyof typeof instructions] || [
      'Review all documents before appointment',
      'Ensure all required parties are present',
      'Have valid identification ready'
    ];
  }

  private getDocumentRequirements(serviceType: string): string[] {
    const requirements = {
      'QUICK_STAMP_LOCAL': [
        'Single document ready for notarization',
        'Document must be complete and unsigned'
      ],
      'STANDARD_NOTARY': [
        'Up to 2 documents ready for notarization',
        'Documents must be complete and unsigned',
        'Any supporting documentation'
      ],
      'EXTENDED_HOURS': [
        'All documents printed and ready',
        'Supporting identification documents',
        'Any reference materials needed'
      ],
      'LOAN_SIGNING': [
        'Complete loan package (provided by lender)',
        'Borrower identification documents',
        'Any additional lender requirements',
        'Wire transfer instructions if required'
      ],
      'RON_SERVICES': [
        'Documents uploaded to secure portal',
        'Digital copies of all supporting docs',
        'Any additional electronic requirements'
      ],
      'BUSINESS_ESSENTIALS': [
        'Corporate documents and resolutions',
        'Business licenses and certificates',
        'Authorized signer documentation'
      ],
      'BUSINESS_GROWTH': [
        'Complete business document package',
        'Corporate resolutions and bylaws',
        'Multiple authorized signer documents'
      ]
    };

    return requirements[serviceType as keyof typeof requirements] || [
      'All documents ready for notarization',
      'Supporting identification documents'
    ];
  }

  private getIdRequirements(serviceType: string): string[] {
    const baseRequirements = [
      'Valid driver\'s license',
      'State-issued ID card',
      'Passport',
      'Military ID',
      'Concealed handgun license'
    ];

    // RON has additional requirements
    if (serviceType === 'RON_SERVICES') {
      return [
        ...baseRequirements,
        'ID must be readable on camera',
        'RFID-enabled documents preferred',
        'Backup form of ID recommended'
      ];
    }

    return baseRequirements;
  }
  
  private getEventColor(status: BookingStatus): string {
    const colorMap: Record<BookingStatus, string> = {
      [BookingStatus.REQUESTED]: '7', // Cyan
      [BookingStatus.PAYMENT_PENDING]: '6', // Orange
      [BookingStatus.CONFIRMED]: '10', // Green
      [BookingStatus.SCHEDULED]: '9', // Blue
      [BookingStatus.AWAITING_CLIENT_ACTION]: '5', // Yellow
      [BookingStatus.READY_FOR_SERVICE]: '9', // Blue
      [BookingStatus.IN_PROGRESS]: '9', // Blue
      [BookingStatus.COMPLETED]: '8', // Grey
      [BookingStatus.CANCELLED_BY_CLIENT]: '11', // Red
      [BookingStatus.CANCELLED_BY_STAFF]: '11', // Red
      [BookingStatus.REQUIRES_RESCHEDULE]: '6', // Orange
      [BookingStatus.NO_SHOW]: '11', // Red
      [BookingStatus.ARCHIVED]: '8', // Grey
    };
    return colorMap[status] || '7'; // Default cyan
  }
  
  async updateBookingEvent(googleEventId: string, booking: any, conversationHistory?: any, notaryInfo?: any) {
    try {
      if (!process.env.GOOGLE_CALENDAR_ID) {
        throw new Error('GOOGLE_CALENDAR_ID environment variable is required');
      }

      // First get the existing event structure
      const existingEvent = await this.calendar.events.get({
        calendarId: process.env.GOOGLE_CALENDAR_ID,
        eventId: googleEventId,
      });
      
      const customerName = booking.User_Booking_signerIdToUser?.name || booking.customerName || 'Guest';
      const serviceName = booking.Service.name || booking.serviceName;
      
      // Update with new data
      const updatedEvent = {
        ...existingEvent.data,
        summary: `${serviceName} - ${customerName}`,
        location: booking.addressStreet ? 
          `${booking.addressStreet}, ${booking.addressCity}, ${booking.addressState} ${booking.addressZip}` : 
          'Remote/Online Service',
        description: this.formatEventDescription(booking, conversationHistory, notaryInfo),
        start: {
          dateTime: booking.scheduledDateTime.toISOString(),
          timeZone: 'America/Chicago',
        },
        end: {
          dateTime: new Date(booking.scheduledDateTime.getTime() + (booking.Service.durationMinutes * 60000)).toISOString(),
          timeZone: 'America/Chicago',
        },
        colorId: this.getEventColor(booking.status),
        // Update attendees, ensuring not to send them notifications if it's just a placeholder
        attendees: [
          // {
          //   email: booking.User_Booking_signerIdToUser?.email || booking.customerEmail,
          //   displayName: customerName,
          //   responseStatus: 'needsAction' // Don't auto-accept for client
          // },
          ...(notaryInfo?.email ? [{
            email: notaryInfo.email,
            displayName: notaryInfo.name || 'Houston Mobile Notary',
            responseStatus: 'accepted'
          }] : [])
        ],
        // Clear out conference data for RON to avoid conflicts, add note instead
        ...(booking.Service.serviceType === 'RON_SERVICES' && {
          conferenceData: {
            notes: "The client has been invited separately via Proof.com. This calendar event is for scheduling purposes."
          }
        })
      };
      
      const response = await this.calendar.events.update({
        calendarId: process.env.GOOGLE_CALENDAR_ID,
        eventId: googleEventId,
        requestBody: updatedEvent,
        conferenceDataVersion: 1, // Required for conference data changes
      });
      
      return response.data;
    } catch (error) {
      console.error('Error updating Google Calendar event:', error);
      throw error;
    }
  }
  
  async deleteBookingEvent(googleEventId: string) {
    try {
      if (!process.env.GOOGLE_CALENDAR_ID) {
        throw new Error('GOOGLE_CALENDAR_ID environment variable is required');
      }

      await this.calendar.events.delete({
        calendarId: process.env.GOOGLE_CALENDAR_ID,
        eventId: googleEventId,
      });
    } catch (error) {
      console.error('Error deleting Google Calendar event:', error);
      throw error;
    }
  }
}

// Export a function to get the instance instead of creating it at module level
export function getGoogleCalendar(): GoogleCalendarService {
  try {
    return GoogleCalendarService.getInstance();
  } catch (error) {
    console.warn('Google Calendar service not available:', error);
    throw error;
  }
}

// For backward compatibility, but only when not in build mode
export const googleCalendar = (() => {
  // Don't instantiate during build time or if env vars are missing
  if (typeof window === 'undefined' && 
      (process.env.NODE_ENV !== 'production' || 
       process.env.NEXT_PHASE === 'phase-production-build' ||
       (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON && !process.env.GOOGLE_SERVICE_ACCOUNT_KEY))) {
    return null as any;
  }
  try {
    return GoogleCalendarService.getInstance();
  } catch (error) {
    console.warn('Google Calendar service not available during build:', error);
    return null as any;
  }
})(); 