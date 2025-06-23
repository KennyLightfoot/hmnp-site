import { google } from 'googleapis';
import { BookingStatus } from '@prisma/client';

export class GoogleCalendarService {
  private calendar;
  
  constructor() {
    let auth;
    
    // Check if we have JSON content as environment variable (production)
    if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      try {
        const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
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
  
  async createBookingEvent(booking: any) {
    try {
      const event = {
        summary: `${booking.service.name} - ${booking.signer?.name || 'Guest'}`,
        location: `${booking.addressStreet}, ${booking.addressCity}, ${booking.addressState} ${booking.addressZip}`,
        description: this.formatEventDescription(booking),
        start: {
          dateTime: booking.scheduledDateTime.toISOString(),
          timeZone: 'America/Chicago',
        },
        end: {
          dateTime: new Date(booking.scheduledDateTime.getTime() + (booking.service.duration * 60000)).toISOString(),
          timeZone: 'America/Chicago',
        },
        colorId: this.getEventColor(booking.status),
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 120 },
            { method: 'email', minutes: 1440 }, // 24 hours
          ],
        },
      };
      
      if (!process.env.GOOGLE_CALENDAR_ID) {
        throw new Error('GOOGLE_CALENDAR_ID environment variable is required');
      }
      
      const response = await this.calendar.events.insert({
        calendarId: process.env.GOOGLE_CALENDAR_ID,
        requestBody: event,
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating Google Calendar event:', error);
      throw error;
    }
  }
  
  private formatEventDescription(booking: any): string {
    return `
Service: ${booking.service.name}
Customer: ${booking.signer?.name || 'Guest'}
Phone: ${booking.signer?.phone || booking.guestPhone || 'Not provided'}
Email: ${booking.signer?.email || booking.guestEmail}
Payment Status: ${booking.status}
Amount: $${booking.priceAtBooking}
Notes: ${booking.notes || 'None'}
Special Instructions: ${booking.specialInstructions || 'None'}
    `.trim();
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
  
  async updateBookingEvent(googleEventId: string, booking: any) {
    try {
      if (!process.env.GOOGLE_CALENDAR_ID) {
        throw new Error('GOOGLE_CALENDAR_ID environment variable is required');
      }

      // First get the existing event structure
      const existingEvent = await this.calendar.events.get({
        calendarId: process.env.GOOGLE_CALENDAR_ID,
        eventId: googleEventId,
      });
      
      // Update with new data
      const updatedEvent = {
        ...existingEvent.data,
        summary: `${booking.service.name} - ${booking.signer?.name || 'Guest'}`,
        location: `${booking.addressStreet}, ${booking.addressCity}, ${booking.addressState} ${booking.addressZip}`,
        description: this.formatEventDescription(booking),
        start: {
          dateTime: booking.scheduledDateTime.toISOString(),
          timeZone: 'America/Chicago',
        },
        end: {
          dateTime: new Date(booking.scheduledDateTime.getTime() + (booking.service.duration * 60000)).toISOString(),
          timeZone: 'America/Chicago',
        },
        colorId: this.getEventColor(booking.status),
      };
      
      const response = await this.calendar.events.update({
        calendarId: process.env.GOOGLE_CALENDAR_ID,
        eventId: googleEventId,
        requestBody: updatedEvent,
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

export const googleCalendar = new GoogleCalendarService(); 