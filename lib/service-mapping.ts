/**
 * Service Type to Service ID Mapping
 * Houston Mobile Notary Pros
 * 
 * Maps frontend serviceType enums to database service IDs
 */

import { prisma } from '@/lib/prisma';

// Service type mapping cache
let serviceMapping: Record<string, string> | null = null;

export async function getServiceIdByType(serviceType: string): Promise<string | null> {
  // Load mapping if not cached
  if (!serviceMapping) {
    await loadServiceMapping();
  }
  
  return serviceMapping?.[serviceType] || null;
}

export async function loadServiceMapping(): Promise<void> {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      select: { id: true, name: true, serviceType: true }
    });
    
    serviceMapping = {};
    
    // Map based on service names and types
    for (const service of services) {
      const name = service.name.toLowerCase();
      
      if (name.includes('standard') && name.includes('notary')) {
        serviceMapping['STANDARD_NOTARY'] = service.id;
      } else if (name.includes('extended') && name.includes('hours')) {
        serviceMapping['EXTENDED_HOURS'] = service.id;
      } else if (name.includes('loan') && name.includes('signing')) {
        serviceMapping['LOAN_SIGNING'] = service.id;
      } else if (name.includes('ron') || name.includes('remote')) {
        serviceMapping['RON_SERVICES'] = service.id;
      } else if (name.includes('quick') && name.includes('stamp')) {
        serviceMapping['QUICK_STAMP_LOCAL'] = service.id;
      } else if (name.includes('business') && name.includes('essential')) {
        serviceMapping['BUSINESS_ESSENTIALS'] = service.id;
      } else if (name.includes('business') && name.includes('growth')) {
        serviceMapping['BUSINESS_GROWTH'] = service.id;
      }
    }
    
    console.log('📋 Loaded service mapping:', serviceMapping);
  } catch (error) {
    console.error('Failed to load service mapping:', error);
    serviceMapping = {};
  }
}

// Fallback static mapping (in case database lookup fails)
export const FALLBACK_SERVICE_MAPPING = {
  'STANDARD_NOTARY': 'standard-notary-id',
  'EXTENDED_HOURS': 'extended-hours-id',
  'LOAN_SIGNING': 'loan-signing-id',
  'RON_SERVICES': 'ron-services-id',
  'QUICK_STAMP_LOCAL': 'quick-stamp-id',
  'BUSINESS_ESSENTIALS': 'business-essentials-id',
  'BUSINESS_GROWTH': 'business-growth-id'
};

export function getServiceTypeDisplayName(serviceType: string): string {
  const displayNames = {
    'STANDARD_NOTARY': 'Standard Notary',
    'EXTENDED_HOURS': 'Extended Hours',
    'LOAN_SIGNING': 'Loan Signing',
    'RON_SERVICES': 'Remote Online Notarization',
    'QUICK_STAMP_LOCAL': 'Quick Stamp Local',
    'BUSINESS_ESSENTIALS': 'Business Essentials',
    'BUSINESS_GROWTH': 'Business Growth'
  };
  
  return displayNames[serviceType as keyof typeof displayNames] || serviceType;
} 