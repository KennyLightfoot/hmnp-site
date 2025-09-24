export const SERVICE_ID_MAP: Record<string, string> = {
  QUICK_STAMP_LOCAL: 'quick-stamp-local-001',
  STANDARD_NOTARY: 'standard-notary-002',
  EXTENDED_HOURS: 'extended-hours-003',
  LOAN_SIGNING: 'loan-signing-004',
  RON_SERVICES: 'ron-services-005',
  BUSINESS_ESSENTIALS: 'business-essentials-006',
  BUSINESS_GROWTH: 'business-growth-007',
};

export function getServiceId(serviceType: string): string {
  const id = SERVICE_ID_MAP[serviceType as keyof typeof SERVICE_ID_MAP];
  if (!id) {
    throw new Error(`Unknown service type: ${serviceType}`);
  }
  return id;
} 