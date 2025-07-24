import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { isAddressMissing } from '@/lib/utils/address';

// A simplified schema focusing only on the address-related logic from the original BookingSchema
const AddressValidationSchema = z.object({
  serviceType: z.string(),
  addressStreet: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: z.string().optional(),
  addressZip: z.string().optional(),
}).refine(data => {
  if (data.serviceType.startsWith('RON')) {
    return true; // RON services don't require an address
  }
  // For non-RON services, check for a valid address
  return !isAddressMissing(data.addressStreet);
}, {
  message: "A valid street address is required for non-RON services.",
  path: ["addressStreet"],
});

// Helper to build a minimal valid booking payload for address validation
function buildAddressPayload(overrides: Partial<any> = {}) {
  return {
    serviceType: 'QUICK_STAMP_LOCAL',
    addressStreet: '123 Main St',
    addressCity: 'Houston',
    addressState: 'TX',
    addressZip: '77002',
    ...overrides
  };
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

describe('Booking Address Validation', () => {
  it('rejects placeholder address for non-RON service', () => {
    const payload = buildAddressPayload({
      addressStreet: 'N/A',
    });
    const result = AddressValidationSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('allows booking when a proper address is supplied for a non-RON service', () => {
    const payload = buildAddressPayload({});
    const result = AddressValidationSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('allows RON booking without a street address', () => {
    const payload = buildAddressPayload({
      serviceType: 'RON_SERVICE',
      addressStreet: undefined,
    });
    const result = AddressValidationSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('allows RON booking with a placeholder address, as it should be ignored', () => {
    const payload = buildAddressPayload({
      serviceType: 'RON_SERVICE',
      addressStreet: 'N/A',
    });
    const result = AddressValidationSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });
}); 