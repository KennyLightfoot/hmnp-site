/**
 * GHL Calendar Mapping Utility
 * Houston Mobile Notary Pros - Phase 2
 * 
 * Maps service types to appropriate GHL calendar IDs for scheduling
 */

// Service types from schema-v2 - Updated to include all 6 website services
export enum ServiceType {
  QUICK_STAMP_LOCAL = 'QUICK_STAMP_LOCAL',        // NEW: Quick-Stamp Local ($50)
  STANDARD_NOTARY = 'STANDARD_NOTARY',
  EXTENDED_HOURS = 'EXTENDED_HOURS', 
  LOAN_SIGNING = 'LOAN_SIGNING',
  RON_SERVICES = 'RON_SERVICES',
  BUSINESS_ESSENTIALS = 'BUSINESS_ESSENTIALS',    // NEW: Business Subscription - Essentials ($125)
  BUSINESS_GROWTH = 'BUSINESS_GROWTH'             // NEW: Business Subscription - Growth ($349)
}

// Calendar mapping configuration - Updated to include all 6 website services
const CALENDAR_MAPPING = {
  [ServiceType.QUICK_STAMP_LOCAL]: 'GHL_STANDARD_NOTARY_CALENDAR_ID',      // NEW: Use standard notary calendar
  [ServiceType.STANDARD_NOTARY]: 'GHL_STANDARD_NOTARY_CALENDAR_ID',
  [ServiceType.EXTENDED_HOURS]: 'GHL_EXTENDED_HOURS_CALENDAR_ID',
  [ServiceType.LOAN_SIGNING]: 'GHL_LOAN_SIGNING_SPECIALIST_CALENDAR_ID',
  [ServiceType.RON_SERVICES]: 'GHL_BOOKING_CALENDAR_ID',
  [ServiceType.BUSINESS_ESSENTIALS]: 'GHL_BOOKING_CALENDAR_ID',            // NEW: Use RON calendar
  [ServiceType.BUSINESS_GROWTH]: 'GHL_BOOKING_CALENDAR_ID'                 // NEW: Use RON calendar
} as const;

/**
 * Get the GHL calendar ID for a specific service type
 */
export function getCalendarIdForService(serviceType: string): string {
  const envVarName = CALENDAR_MAPPING[serviceType as ServiceType];
  
  if (!envVarName) {
    throw new Error(`Unsupported service type: ${serviceType}. Supported types: ${Object.keys(CALENDAR_MAPPING).join(', ')}`);
  }

  const calendarId = process.env[envVarName];
  
  if (!calendarId) {
    throw new Error(`GHL calendar ID required for ${serviceType} service. Set ${envVarName} environment variable.`);
  }

  return calendarId.trim();
}

/**
 * Get all configured calendar mappings
 */
export function getAllCalendarMappings(): Record<ServiceType, string> {
  const mappings = {} as Record<ServiceType, string>;
  
  for (const [serviceType, envVarName] of Object.entries(CALENDAR_MAPPING)) {
    try {
      const calendarId = process.env[envVarName];
      if (calendarId) {
        mappings[serviceType as ServiceType] = calendarId.trim();
      }
    } catch (error) {
      console.warn(`Missing calendar configuration for ${serviceType}: ${error}`);
    }
  }
  
  return mappings;
}

/**
 * Validate all calendar mappings are configured
 */
export function validateCalendarMappings(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const [serviceType, envVarName] of Object.entries(CALENDAR_MAPPING)) {
    const calendarId = process.env[envVarName];
    if (!calendarId) {
      errors.push(`${serviceType}: Missing ${envVarName} environment variable`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get service type from calendar ID (reverse lookup)
 */
export function getServiceTypeFromCalendarId(calendarId: string): ServiceType | null {
  const mappings = getAllCalendarMappings();
  
  for (const [serviceType, mappedCalendarId] of Object.entries(mappings)) {
    if (mappedCalendarId === calendarId) {
      return serviceType as ServiceType;
    }
  }
  
  return null;
}

/**
 * Get calendar display name for service type
 */
export function getCalendarDisplayName(serviceType: ServiceType): string {
  const displayNames = {
    [ServiceType.QUICK_STAMP_LOCAL]: 'Quick-Stamp Local Services',        // NEW
    [ServiceType.STANDARD_NOTARY]: 'Standard Notary Services',
    [ServiceType.EXTENDED_HOURS]: 'Extended Hours Services',
    [ServiceType.LOAN_SIGNING]: 'Loan Signing Specialist',
    [ServiceType.RON_SERVICES]: 'Remote Online Notarization',
    [ServiceType.BUSINESS_ESSENTIALS]: 'Business Subscription - Essentials', // NEW
    [ServiceType.BUSINESS_GROWTH]: 'Business Subscription - Growth'        // NEW
  };
  
  return displayNames[serviceType] || serviceType;
}