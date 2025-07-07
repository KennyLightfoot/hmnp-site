/**
 * GHL Calendar Mapping Utility
 * Houston Mobile Notary Pros - Phase 2
 * 
 * Maps service types to appropriate GHL calendar IDs for scheduling
 */

import { getRequiredCleanEnv } from '../env-clean';

// Service types from schema-v2
export enum ServiceType {
  STANDARD_NOTARY = 'STANDARD_NOTARY',
  EXTENDED_HOURS = 'EXTENDED_HOURS', 
  LOAN_SIGNING = 'LOAN_SIGNING',
  RON_SERVICES = 'RON_SERVICES'
}

// Calendar mapping configuration
const CALENDAR_MAPPING = {
  [ServiceType.STANDARD_NOTARY]: 'GHL_STANDARD_NOTARY_CALENDAR_ID',
  [ServiceType.EXTENDED_HOURS]: 'GHL_EXTENDED_HOURS_CALENDAR_ID',
  [ServiceType.LOAN_SIGNING]: 'GHL_LOAN_SIGNING_SPECIALIST_CALENDAR_ID',
  [ServiceType.RON_SERVICES]: 'GHL_BOOKING_CALENDAR_ID'
} as const;

/**
 * Get the GHL calendar ID for a specific service type
 */
export function getCalendarIdForService(serviceType: string): string {
  const envVarName = CALENDAR_MAPPING[serviceType as ServiceType];
  
  if (!envVarName) {
    throw new Error(`Unsupported service type: ${serviceType}. Supported types: ${Object.keys(CALENDAR_MAPPING).join(', ')}`);
  }

  const calendarId = getRequiredCleanEnv(
    envVarName, 
    `GHL calendar ID required for ${serviceType} service`
  );

  return calendarId;
}

/**
 * Get all configured calendar mappings
 */
export function getAllCalendarMappings(): Record<ServiceType, string> {
  const mappings = {} as Record<ServiceType, string>;
  
  for (const [serviceType, envVarName] of Object.entries(CALENDAR_MAPPING)) {
    try {
      mappings[serviceType as ServiceType] = getRequiredCleanEnv(
        envVarName,
        `Calendar mapping for ${serviceType}`
      );
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
    try {
      getRequiredCleanEnv(envVarName, `Validation for ${serviceType}`);
    } catch (error) {
      errors.push(`${serviceType}: ${error}`);
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
    [ServiceType.STANDARD_NOTARY]: 'Standard Notary Services',
    [ServiceType.EXTENDED_HOURS]: 'Extended Hours Services',
    [ServiceType.LOAN_SIGNING]: 'Loan Signing Specialist',
    [ServiceType.RON_SERVICES]: 'Remote Online Notarization'
  };
  
  return displayNames[serviceType] || serviceType;
}