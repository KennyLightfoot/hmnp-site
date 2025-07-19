import { describe, it, expect } from 'vitest';
import { isAddressMissing } from '@/lib/utils/address';
import { BookingSchema } from '../app/api/booking/route';

// Helper to build minimal valid booking payload
function buildBasePayload(overrides: Partial<any> = {}) {
  return {
    serviceType: 'QUICK_STAMP_LOCAL',
    customerName: 'Test User',
    customerEmail: 'test@example.com',
    scheduledDateTime: new Date(Date.now() + 86_400_000).toISOString(), // +1 day
    timeZone: 'America/Chicago',
    pricing: {
      basePrice: 50,
      travelFee: 0,
      totalPrice: 50
    },
    numberOfDocuments: 1,
    numberOfSigners: 1,
    ...overrides
  } as const;
}

describe('Address validation helper', () => {
  it('treats "N/A" as missing', () => {
    expect(isAddressMissing('N/A')).toBe(true);
    expect(isAddressMissing('n/a')).toBe(true);
  });

  it('accepts a real street address', () => {
    expect(isAddressMissing('123 Main St')).toBe(false);
  });
});

describe('BookingSchema – address edge cases', () => {
  it('rejects placeholder address for non-RON service', () => {
    const payload = buildBasePayload({
      addressStreet: 'N/A',
      addressCity: 'Houston',
      addressState: 'TX',
      addressZip: '77001'
    });

    expect(() => BookingSchema.parse(payload)).toThrow();
  });

  it('allows booking when a proper address is supplied', () => {
    const payload = buildBasePayload({
      addressStreet: '123 Main St',
      addressCity: 'Houston',
      addressState: 'TX',
      addressZip: '77002'
    });

    expect(() => BookingSchema.parse(payload)).not.toThrow();
  });

  it('allows RON booking without address', () => {
    const payload = buildBasePayload({
      serviceType: 'RON_SERVICES',
      addressStreet: undefined,
      addressCity: undefined,
      addressState: undefined,
      addressZip: undefined
    });

    expect(() => BookingSchema.parse(payload)).not.toThrow();
  });
});
