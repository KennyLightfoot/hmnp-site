/**
 * Temporary Google Calendar Service Replacement
 * 
 * This service provides a safe fallback for Google Calendar integration
 * to prevent booking system failures when calendar API is unavailable
 * or misconfigured.
 */

interface BookingCalendarEvent {
  id: string | null;
  url?: string;
  status?: string;
}

export class GoogleCalendarService {
  private isEnabled = false;

  constructor() {
    // Log that calendar integration is disabled
    console.log('[GOOGLE CALENDAR] Service disabled - using fallback mode');
  }

  /**
   * Create a booking event (disabled fallback)
   */
  async createBookingEvent(booking: any): Promise<BookingCalendarEvent> {
    console.log(`[GOOGLE CALENDAR] Event creation skipped for booking: ${booking.id}`);
    console.log(`[GOOGLE CALENDAR] Service: ${booking.Service?.name || 'Unknown'}`);
    console.log(`[GOOGLE CALENDAR] DateTime: ${booking.scheduledDateTime || 'Not scheduled'}`);
    
    // Return null ID to indicate no calendar event was created
    return { 
      id: null,
      status: 'disabled',
      url: undefined
    };
  }

  /**
   * Update a booking event (disabled fallback)
   */
  async updateBookingEvent(eventId: string | null, booking: any): Promise<BookingCalendarEvent> {
    console.log(`[GOOGLE CALENDAR] Event update skipped for booking: ${booking.id}`);
    console.log(`[GOOGLE CALENDAR] EventId: ${eventId || 'None'}`);
    
    return { 
      id: eventId,
      status: 'disabled',
      url: undefined
    };
  }

  /**
   * Delete a booking event (disabled fallback)
   */
  async deleteBookingEvent(eventId: string | null): Promise<boolean> {
    console.log(`[GOOGLE CALENDAR] Event deletion skipped for eventId: ${eventId || 'None'}`);
    
    // Return true to indicate "successful" deletion (no-op)
    return true;
  }

  /**
   * Check if calendar service is available
   */
  isAvailable(): boolean {
    return this.isEnabled;
  }

  /**
   * Get calendar integration status
   */
  getStatus(): { enabled: boolean; reason: string } {
    return {
      enabled: this.isEnabled,
      reason: 'Google Calendar integration temporarily disabled for stability'
    };
  }

  /**
   * Enable calendar integration (for future use)
   */
  enable(): void {
    this.isEnabled = true;
    console.log('[GOOGLE CALENDAR] Service enabled');
  }

  /**
   * Disable calendar integration
   */
  disable(): void {
    this.isEnabled = false;
    console.log('[GOOGLE CALENDAR] Service disabled');
  }
}