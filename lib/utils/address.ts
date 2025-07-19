export const PLACEHOLDER_ADDRESS_VALUES = ['n/a', 'na', 'n\\/a'] as const;

/**
 * Normalise a street address string.
 * - Trims whitespace
 * - Converts empty / placeholder / very short strings (<5 chars) to `undefined`
 *
 * This keeps downstream Zod schemas lean by allowing us to treat
 * `undefined` the same as a missing address.
 */
export function normalizeAddress(input: unknown): string | undefined {
  if (typeof input !== 'string') return undefined;
  const trimmed = input.trim();
  if (!trimmed) return undefined;
  if (trimmed.length < 5) return undefined;
  if (PLACEHOLDER_ADDRESS_VALUES.includes(trimmed.toLowerCase() as any)) return undefined;
  return trimmed;
}

/**
 * Convenience wrapper used by API routes to decide if an address is missing.
 */
export function isAddressMissing(input: unknown): boolean {
  return normalizeAddress(input) === undefined;
} 