import { SERVICES_CONFIG, type ServiceId } from './config';
import { getCalendarIdForService } from '@/lib/ghl/calendar-mapping';

/**
 * Mapping utilities for services: enums ⇄ slugs ⇄ calendar IDs
 */

export function toServiceId(input: string): ServiceId | null {
  if (!input) return null;
  const normalized = input.replace(/-/g, '_').toUpperCase();
  return (normalized in SERVICES_CONFIG ? (normalized as ServiceId) : null);
}

export function toSlug(serviceId: ServiceId): string {
  return serviceId.toLowerCase().replace(/_/g, '-');
}

export function getCalendarId(serviceType: string | ServiceId): string {
  const id = typeof serviceType === 'string' ? toServiceId(serviceType) : serviceType;
  if (!id) throw new Error(`Unknown service type: ${serviceType}`);
  return getCalendarIdForService(id);
}

export function getDisplayName(serviceType: string | ServiceId): string {
  const id = typeof serviceType === 'string' ? toServiceId(serviceType) : serviceType;
  if (!id) return String(serviceType);
  return SERVICES_CONFIG[id].displayName;
}


