import { describe, it, expect } from 'vitest';
import { UnifiedPricingEngine, TransparentPricingRequestSchema } from '@/lib/pricing/unified-pricing-engine';

function buildRequest(overrides: Partial<any> = {}) {
  return {
    serviceType: 'QUICK_STAMP_LOCAL',
    documentCount: 1,
    signerCount: 1,
    scheduledDateTime: new Date(Date.now() + 86_400_000).toISOString(),
    ...overrides,
  } as const;
}

describe('Transparent Pricing – address rules', () => {
  it('calculates RON pricing with null address', async () => {
    const req = buildRequest({ serviceType: 'RON_SERVICES', address: null });
    await expect(UnifiedPricingEngine.calculateTransparentPricing(req as any)).resolves.toHaveProperty('totalPrice');
  });

  it('rejects non-RON pricing without address', async () => {
    const req = buildRequest({ serviceType: 'STANDARD_NOTARY', address: null });
    await expect(() => TransparentPricingRequestSchema.parse(req)).toThrow();
  });
}); 