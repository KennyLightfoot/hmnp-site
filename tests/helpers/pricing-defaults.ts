/**
 * Default options and types for pricing tests to ensure consistency
 */

export interface PricingOptions {
  priority: boolean;
  weatherAlert: boolean;
  sameDay: boolean;
  [key: string]: any; // Allow for additional properties
}

/**
 * Default pricing options - use this instead of empty objects
 */
export const DEFAULT_PRICING_OPTIONS: PricingOptions = {
  priority: false,
  weatherAlert: false,
  sameDay: false,
};

/**
 * Common pricing option variations for testing
 */
export const PRICING_OPTION_VARIANTS = {
  standard: DEFAULT_PRICING_OPTIONS,
  priority: { ...DEFAULT_PRICING_OPTIONS, priority: true },
  sameDay: { ...DEFAULT_PRICING_OPTIONS, sameDay: true },
  weatherAlert: { ...DEFAULT_PRICING_OPTIONS, weatherAlert: true },
  allFeatures: {
    priority: true,
    weatherAlert: true,
    sameDay: true,
  },
} as const;

/**
 * Helper function to create pricing options with overrides
 * @param overrides - Properties to override from defaults
 * @returns Complete pricing options object
 */
export function createPricingOptions(overrides: Partial<PricingOptions> = {}): PricingOptions {
  return {
    ...DEFAULT_PRICING_OPTIONS,
    ...overrides,
  };
}