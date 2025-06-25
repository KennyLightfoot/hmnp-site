/**
 * Centralized Service Type Definitions
 * Resolves inconsistencies between Prisma enums and frontend components
 * Provides mapping functions for consistent service type handling
 */

import { ServiceType as PrismaServiceType } from '@prisma/client';

// Frontend service type (used in forms, components, and API responses)
export type FrontendServiceType = 
  | "essential"
  | "priority" 
  | "loan-signing"
  | "reverse-mortgage"
  | "specialty"
  | "standard-notary"
  | "extended-hours-notary"
  | "loan-signing-specialist"
  | "specialty-notary-service"
  | "business-solutions"
  | "support-service";

// Mapping from Prisma enums to frontend types
export const PRISMA_TO_FRONTEND_SERVICE_MAP: Record<PrismaServiceType, FrontendServiceType> = {
  STANDARD_NOTARY: "standard-notary",
  EXTENDED_HOURS_NOTARY: "extended-hours-notary",
  LOAN_SIGNING_SPECIALIST: "loan-signing-specialist",
  SPECIALTY_NOTARY_SERVICE: "specialty-notary-service",
  BUSINESS_SOLUTIONS: "business-solutions",
  SUPPORT_SERVICE: "support-service",
};

// Reverse mapping from frontend types to Prisma enums
export const FRONTEND_TO_PRISMA_SERVICE_MAP: Record<FrontendServiceType, PrismaServiceType> = {
  "essential": "STANDARD_NOTARY", // Map essential to standard notary
  "priority": "EXTENDED_HOURS_NOTARY", // Map priority to extended hours
  "loan-signing": "LOAN_SIGNING_SPECIALIST",
  "reverse-mortgage": "LOAN_SIGNING_SPECIALIST", // Special case
  "specialty": "SPECIALTY_NOTARY_SERVICE",
  "standard-notary": "STANDARD_NOTARY",
  "extended-hours-notary": "EXTENDED_HOURS_NOTARY", 
  "loan-signing-specialist": "LOAN_SIGNING_SPECIALIST",
  "specialty-notary-service": "SPECIALTY_NOTARY_SERVICE",
  "business-solutions": "BUSINESS_SOLUTIONS",
  "support-service": "SUPPORT_SERVICE",
};

// Display names for frontend
export const SERVICE_DISPLAY_NAMES: Record<FrontendServiceType, string> = {
  "essential": "Essential Notary Services",
  "priority": "Priority/Same-Day Service",
  "loan-signing": "Loan Signing Services", 
  "reverse-mortgage": "Reverse Mortgage Signing",
  "specialty": "Specialty Notary Services",
  "standard-notary": "Standard Mobile Notary",
  "extended-hours-notary": "Extended Hours Notary",
  "loan-signing-specialist": "Loan Signing Specialist",
  "specialty-notary-service": "Specialty Notary Service",
  "business-solutions": "Business Solutions",
  "support-service": "Support Services",
};

// Service descriptions
export const SERVICE_DESCRIPTIONS: Record<FrontendServiceType, string> = {
  "essential": "Basic notarization services for everyday documents",
  "priority": "Same-day or urgent notarization services",
  "loan-signing": "Complete loan document signing and notarization",
  "reverse-mortgage": "Specialized reverse mortgage document processing",
  "specialty": "Specialized notary services for unique documents",
  "standard-notary": "Standard mobile notary services",
  "extended-hours-notary": "Notary services outside normal business hours",
  "loan-signing-specialist": "Expert loan signing agent services",
  "specialty-notary-service": "Specialized notarization for complex documents",
  "business-solutions": "Corporate and business notary solutions",
  "support-service": "Additional support and consultation services",
};

// Service ordering priority (lower numbers = higher priority in UI)
export const SERVICE_PRIORITY_ORDER: Record<FrontendServiceType, number> = {
  "priority": 1,           // Most urgent, show first
  "essential": 2,          // Basic service, show second  
  "standard-notary": 3,    // Standard service
  "loan-signing": 4,       // High-value service
  "extended-hours-notary": 5,
  "specialty": 6,
  "business-solutions": 7,
  "reverse-mortgage": 8,
  "loan-signing-specialist": 9,
  "specialty-notary-service": 10,
  "support-service": 11,
};

// Default durations for services (in minutes)
export const SERVICE_DEFAULT_DURATIONS: Record<FrontendServiceType, number> = {
  "essential": 60,
  "priority": 60,
  "loan-signing": 90,
  "reverse-mortgage": 90,
  "specialty": 60,
  "standard-notary": 60,
  "extended-hours-notary": 60,
  "loan-signing-specialist": 90,
  "specialty-notary-service": 60,
  "business-solutions": 120,
  "support-service": 30,
};

/**
 * Type guard to check if a string is a valid FrontendServiceType
 */
export function isValidFrontendServiceType(value: string): value is FrontendServiceType {
  return Object.keys(FRONTEND_TO_PRISMA_SERVICE_MAP).includes(value as FrontendServiceType);
}

/**
 * Map a Prisma service type to frontend type
 */
export function mapPrismaToFrontend(prismaType: PrismaServiceType): FrontendServiceType {
  return PRISMA_TO_FRONTEND_SERVICE_MAP[prismaType];
}

/**
 * Map a frontend service type to Prisma type
 */
export function mapFrontendToPrisma(frontendType: FrontendServiceType): PrismaServiceType {
  return FRONTEND_TO_PRISMA_SERVICE_MAP[frontendType];
}

/**
 * Get display name for a service type
 */
export function getServiceDisplayName(serviceType: FrontendServiceType): string {
  return SERVICE_DISPLAY_NAMES[serviceType] || serviceType;
}

/**
 * Get description for a service type
 */
export function getServiceDescription(serviceType: FrontendServiceType): string {
  return SERVICE_DESCRIPTIONS[serviceType] || 'Professional notary services';
}

/**
 * Get default duration for a service type
 */
export function getServiceDefaultDuration(serviceType: FrontendServiceType): number {
  return SERVICE_DEFAULT_DURATIONS[serviceType] || 60;
}

/**
 * Get priority order for a service type (for sorting)
 */
export function getServicePriorityOrder(serviceType: FrontendServiceType): number {
  return SERVICE_PRIORITY_ORDER[serviceType] || 999;
}

/**
 * Get all available frontend service types sorted by priority
 */
export function getAllFrontendServiceTypesSorted(): FrontendServiceType[] {
  return (Object.keys(FRONTEND_TO_PRISMA_SERVICE_MAP) as FrontendServiceType[])
    .sort((a, b) => getServicePriorityOrder(a) - getServicePriorityOrder(b));
}

/**
 * Get all available frontend service types
 */
export function getAllFrontendServiceTypes(): FrontendServiceType[] {
  return Object.keys(FRONTEND_TO_PRISMA_SERVICE_MAP) as FrontendServiceType[];
}

/**
 * Get all available Prisma service types
 */
export function getAllPrismaServiceTypes(): PrismaServiceType[] {
  return Object.values(PrismaServiceType);
}

/**
 * Validate and convert service type for API usage
 */
export function validateAndConvertServiceType(
  input: string,
  targetType: 'frontend' | 'prisma' = 'frontend'
): { isValid: boolean; converted?: FrontendServiceType | PrismaServiceType; error?: string } {
  
  // First, try as frontend type
  if (isValidFrontendServiceType(input)) {
    if (targetType === 'frontend') {
      return { isValid: true, converted: input };
    } else {
      return { isValid: true, converted: mapFrontendToPrisma(input) };
    }
  }
  
  // Try as Prisma type
  if (isValidPrismaServiceType(input)) {
    if (targetType === 'prisma') {
      return { isValid: true, converted: input as PrismaServiceType };
    } else {
      return { isValid: true, converted: mapPrismaToFrontend(input as PrismaServiceType) };
    }
  }
  
  return {
    isValid: false,
    error: `Invalid service type: ${input}. Must be one of: ${getAllFrontendServiceTypes().join(', ')}`
  };
}

/**
 * Service type utilities for forms and validation
 */
export const ServiceTypeUtils = {
  // For use in Zod schemas
  frontendEnum: getAllFrontendServiceTypes(),
  
  // For use in select options
  getSelectOptions: () => getAllFrontendServiceTypes().map(type => ({
    value: type,
    label: getServiceDisplayName(type),
    description: getServiceDescription(type)
  })),
  
  // For use in API validation
  validateFrontendType: (value: string): value is FrontendServiceType => 
    isValidFrontendServiceType(value),
  
  // For use in database operations
  validatePrismaType: (value: string): value is PrismaServiceType =>
    isValidPrismaServiceType(value),
};

// Export commonly used types and constants
export { PrismaServiceType }; 