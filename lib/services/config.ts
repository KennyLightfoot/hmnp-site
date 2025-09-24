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
  | 'BUSINESS_GROWTH';

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
  ronNotarialFee?: number; // default additional fee for notarial (itemized)
  sealPrice?: number; // per-seal fee for RON
}

export const SERVICES_CONFIG: Record<ServiceId, ServiceConfig> = {
  STANDARD_NOTARY: {
    id: 'STANDARD_NOTARY',
    displayName: 'Standard Mobile Notary',
    basePrice: 75,
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
    basePrice: 25, // base session
    ronNotarialFee: 10, // default notarial fee (itemized to reach $35)
    sealPrice: 5, // per seal
    maxDocuments: 10,
    includedRadius: 0,
    feePerMile: 0,
    defaultDurationMinutes: 30,
    businessHours: { start: 0, end: 24, days: [0, 1, 2, 3, 4, 5, 6] }
  },
  BUSINESS_ESSENTIALS: {
    id: 'BUSINESS_ESSENTIALS',
    displayName: 'Business Subscription - Essentials',
    basePrice: 125,
    maxDocuments: 10,
    includedRadius: 30,
    feePerMile: 0.5,
    defaultDurationMinutes: 60,
    businessHours: { start: 9, end: 17, days: [1, 2, 3, 4, 5] }
  },
  BUSINESS_GROWTH: {
    id: 'BUSINESS_GROWTH',
    displayName: 'Business Subscription - Growth',
    basePrice: 349,
    maxDocuments: 50,
    includedRadius: 50,
    feePerMile: 0.25,
    defaultDurationMinutes: 60,
    businessHours: { start: 9, end: 17, days: [1, 2, 3, 4, 5] }
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


