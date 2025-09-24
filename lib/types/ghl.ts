/**
 * TypeScript type definitions for Go High Level (GHL) integration
 */

/**
 * GHL Contact interface
 */
export interface GHLContact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  tags?: string[];
  customFields?: GHLCustomField[];
}

/**
 * GHL Custom Field interface
 */
export interface GHLCustomField {
  id: string;
  value: string | number | boolean | Date | null;
}

/**
 * GHL Appointment interface 
 */
export interface GHLAppointment {
  id?: string;
  title: string;
  description?: string;
  startTime: string; // ISO date string
  endTime: string;   // ISO date string
  contactId: string;
  calendarId?: string;
  status?: 'confirmed' | 'cancelled' | 'rescheduled' | 'no-show';
}

/**
 * GHL API response interface
 */
export interface GHLResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * GHL service interface
 */
export interface GHLService {
  // Contact management
  getContact(email: string): Promise<GHLResponse<GHLContact>>;
  createContact(contactData: Partial<GHLContact>): Promise<GHLResponse<GHLContact>>;
  updateContact(contactId: string, contactData: Partial<GHLContact>): Promise<GHLResponse<GHLContact>>;
  upsertContact(contactData: Partial<GHLContact>): Promise<GHLResponse<GHLContact>>;
  addTagsToContact(contactId: string, tags: string[]): Promise<GHLResponse<{ success: boolean }>>;
  removeTagsFromContact(contactId: string, tags: string[]): Promise<GHLResponse<{ success: boolean }>>;
  
  // Appointment management
  createAppointment(appointment: GHLAppointment): Promise<GHLResponse<GHLAppointment>>;
  updateAppointment(appointmentId: string, appointment: Partial<GHLAppointment>): Promise<GHLResponse<GHLAppointment>>;
  cancelAppointment(appointmentId: string, reason?: string): Promise<GHLResponse<{ success: boolean }>>;
  rescheduleAppointment(appointmentId: string, startTime: string, endTime: string): Promise<GHLResponse<GHLAppointment>>;
}
