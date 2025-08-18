/**
 * Centralized Service Type Definitions
 * Resolves inconsistencies between Prisma enums and frontend components
 * Provides mapping functions for consistent service type handling
 */

import { ServiceType as PrismaServiceType } from '@prisma/client';

// Frontend service type (SOP COMPLIANT - ONLY APPROVED TYPES)
export type FrontendServiceType = 
  | "standard-notary"        // Was "standard-notary" - SOP COMPLIANT
  | "extended-hours-notary"  // Was "extended-hours-notary" - SOP COMPLIANT
  | "loan-signing-specialist" // Was "loan-signing-specialist" - SOP COMPLIANT
  | "specialty-notary-service" // Was "specialty" - SOP COMPLIANT
  | "business-solutions"
  | "support-service";

// Mapping from Prisma enums to frontend types
export const PRISMA_TO_FRONTEND_SERVICE_MAP: Partial<Record<PrismaServiceType, FrontendServiceType>> = {
  STANDARD_NOTARY: "standard-notary",
  EXTENDED_HOURS: "extended-hours-notary",
  LOAN_SIGNING: "loan-signing-specialist",
  SPECIALTY_NOTARY: "specialty-notary-service",
  BUSINESS_SOLUTIONS: "business-solutions",
  RON_SERVICES: "standard-notary", // Map to standard notary
  BUSINESS_ESSENTIALS: "business-solutions", // Map to business solutions
  BUSINESS_GROWTH: "business-solutions", // Map to business solutions
  ESTATE_PLANNING: "specialty-notary-service", // Map to specialty notary
};

// SOP COMPLIANT: Frontend to Prisma mapping (FORBIDDEN TYPES REMOVED)
export const FRONTEND_TO_PRISMA_SERVICE_MAP: Record<FrontendServiceType, PrismaServiceType> = {
  "standard-notary": "STANDARD_NOTARY",
  "extended-hours-notary": "EXTENDED_HOURS", 
  "loan-signing-specialist": "LOAN_SIGNING",
  "specialty-notary-service": "SPECIALTY_NOTARY",
  "business-solutions": "BUSINESS_SOLUTIONS",
  "support-service": "BUSINESS_SOLUTIONS", // Map to business solutions
};

// SOP COMPLIANT: Display names (FORBIDDEN TYPES REMOVED)
export const SERVICE_DISPLAY_NAMES: Record<FrontendServiceType, string> = {
  "standard-notary": "Standard Notary Services",           // SOP: $75, 15-mile radius, 9am-5pm Mon-Fri
  "extended-hours-notary": "Extended Hours Notary",       // SOP: $100, 20-mile radius, 7am-9pm Daily
  "loan-signing-specialist": "Loan Signing Specialist",   // SOP: $150 flat fee, unlimited docs, 4 signers
  "specialty-notary-service": "Specialty Notary Service",
  "business-solutions": "Business Solutions",
  "support-service": "Support Services",
};

// SOP COMPLIANT: Service descriptions with exact specifications
export const SERVICE_DESCRIPTIONS: Record<FrontendServiceType, string> = {
  "standard-notary": "Standard mobile notary services. Base: up to 2 documents, 1-2 signers, 15-mile travel included. Monday-Friday, 9am-5pm. Starting at $75.",
  "extended-hours-notary": "Extended hours notary services. Base: up to 5 documents, 2 signers, 20-mile travel included. 7am-9pm Daily. Also for urgent/same-day needs. $100 flat fee.",
  "loan-signing-specialist": "Expert loan signing agent services. $150 flat fee includes unlimited documents for single signing session, up to 4 signers, 90-minute session. By appointment.",
  "specialty-notary-service": "Specialized notarization for complex documents and unique requirements",
  "business-solutions": "Corporate and business notary solutions with flexible scheduling",
  "support-service": "Additional support and consultation services",
};

/**
 * Convert Prisma ServiceType to frontend type
 */
export function mapPrismaToFrontend(prismaType: PrismaServiceType): FrontendServiceType {
  return PRISMA_TO_FRONTEND_SERVICE_MAP[prismaType] ?? "standard-notary";
}

/**
 * Convert frontend type to Prisma ServiceType
 */
export function mapFrontendToPrisma(frontendType: FrontendServiceType): PrismaServiceType {
  return FRONTEND_TO_PRISMA_SERVICE_MAP[frontendType];
}

/**
 * Check if a string is a valid frontend service type
 */
export function isValidFrontendServiceType(value: string): value is FrontendServiceType {
  return Object.keys(FRONTEND_TO_PRISMA_SERVICE_MAP).includes(value as FrontendServiceType);
}

/**
 * Check if a value is a valid Prisma service type
 */
export function isValidPrismaServiceType(value: string): value is PrismaServiceType {
  return Object.values(PrismaServiceType).includes(value as PrismaServiceType);
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