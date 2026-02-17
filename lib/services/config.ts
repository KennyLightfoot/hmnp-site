/**
 * Centralized Services Configuration
 * Single source of truth for service metadata, pricing, durations and hours
 */

export type ServiceId =
  | 'STANDARD_NOTARY'
  | 'EXTENDED_HOURS'
  | 'LOAN_SIGNING'
  | 'RON_SERVICES'
  | 'BUSINESS_ESSENTIALS'
  | 'BUSINESS_GROWTH'
  | 'ENTERPRISE_PARTNER';

export interface BusinessHours {
  start: number; // hour in 24h
  end: number;   // hour in 24h
  days: number[]; // 0-6 (Sun-Sat)
}

export interface ServiceConfig {
  id: ServiceId;
  displayName: string;
  basePrice: number;
  maxDocuments: number;
  includedRadius: number; // miles
  feePerMile: number; // USD per mile beyond includedRadius
  defaultDurationMinutes: number;
  businessHours: BusinessHours;
  // RON-specific fields (ignored for non-RON services)
  sealPrice?: number;           // per additional seal fee
  signerFee?: number;           // per additional signer fee
  witnessFee?: number;          // optional witness service fee
  estatePackagePrice?: number;  // estate planning bundle price
  realEstatePackagePrice?: number; // real estate seller package price
  bufferMinutes?: number;       // buffer between sessions
}

export const SERVICES_CONFIG: Record<ServiceId, ServiceConfig> = {
  STANDARD_NOTARY: {
    id: 'STANDARD_NOTARY',
    displayName: 'Standard Mobile Notary',
    basePrice: 85,
    maxDocuments: 4,
    includedRadius: 20,
    feePerMile: 0.5,
    defaultDurationMinutes: 60,
    businessHours: { start: 9, end: 17, days: [1, 2, 3, 4, 5] }
  },
  EXTENDED_HOURS: {
    id: 'EXTENDED_HOURS',
    displayName: 'Extended Hours Mobile',
    basePrice: 125,
    maxDocuments: 4,
    includedRadius: 30,
    feePerMile: 0.5,
    defaultDurationMinutes: 60,
    businessHours: { start: 7, end: 21, days: [0, 1, 2, 3, 4, 5, 6] }
  },
  LOAN_SIGNING: {
    id: 'LOAN_SIGNING',
    displayName: 'Loan Signing Specialist',
    basePrice: 175,
    maxDocuments: 999,
    includedRadius: 30,
    feePerMile: 0.5,
    defaultDurationMinutes: 90,
    businessHours: { start: 8, end: 18, days: [1, 2, 3, 4, 5] }
  },
  RON_SERVICES: {
    id: 'RON_SERVICES',
    displayName: 'Remote Online Notarization',
    basePrice: 25,           // Standard Online Notarization (1 seal included)
    sealPrice: 10,           // Each additional seal/stamp
    signerFee: 15,           // Each additional signer beyond first
    witnessFee: 25,          // Optional remote witness service
    estatePackagePrice: 75,  // Estate Planning Bundle (2 signers + 5 seals)
    realEstatePackagePrice: 125, // Real Estate Seller Package (2 signers + unlimited seals)
    maxDocuments: 20,
    includedRadius: 0,
    feePerMile: 0,
    defaultDurationMinutes: 30,
    bufferMinutes: 15,       // Buffer between sessions
    businessHours: { start: 0, end: 24, days: [0, 1, 2, 3, 4, 5, 6] }
  },
  BUSINESS_ESSENTIALS: {
    id: 'BUSINESS_ESSENTIALS',
    displayName: 'Starter Partner Subscription',
    basePrice: 199,
    maxDocuments: 15,
    includedRadius: 20,
    feePerMile: 0.5,
    defaultDurationMinutes: 60,
    businessHours: { start: 9, end: 17, days: [1, 2, 3, 4, 5] }
  },
  BUSINESS_GROWTH: {
    id: 'BUSINESS_GROWTH',
    displayName: 'Growth Partner Subscription',
    basePrice: 499,
    maxDocuments: 50,
    includedRadius: 30,
    feePerMile: 0.5,
    defaultDurationMinutes: 60,
    businessHours: { start: 7, end: 21, days: [0, 1, 2, 3, 4, 5, 6] }
  },
  ENTERPRISE_PARTNER: {
    id: 'ENTERPRISE_PARTNER',
    displayName: 'Enterprise Partner Subscription',
    basePrice: 1199,
    maxDocuments: 150,
    includedRadius: 40,
    feePerMile: 0.5,
    defaultDurationMinutes: 60,
    businessHours: { start: 0, end: 24, days: [0, 1, 2, 3, 4, 5, 6] }
  }
};

export const SERVICE_IDS = Object.keys(SERVICES_CONFIG) as ServiceId[];

export function getServiceDurationMinutes(serviceType: string | ServiceId): number {
  const id = serviceType.toUpperCase() as ServiceId;
  return SERVICES_CONFIG[id]?.defaultDurationMinutes ?? 60;
}

export function getBusinessHours(serviceType: string | ServiceId): BusinessHours {
  const id = serviceType.toUpperCase() as ServiceId;
  return SERVICES_CONFIG[id]?.businessHours || { start: 9, end: 17, days: [1, 2, 3, 4, 5] };
}


