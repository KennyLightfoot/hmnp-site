/**
 * Booking API (legacy shim)
 * Delegates to app/api/booking/create/route.ts which contains the canonical handler.
 * TODO: Remove after all consumers migrate.
 */
export { POST } from './create/route';
