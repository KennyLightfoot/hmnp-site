export const PLACEHOLDER_ADDRESS_VALUES = ['n/a', 'na', 'n/a'] as const;

/**
 * Check if an address value should be treated as "missing".
 * Handles:
 *   • null / undefined
 *   • empty strings / placeholder values ("N/A", "n/a", etc.)
 *   • strings shorter than 5 characters after trimming
 */
export function isAddressMissing(address: unknown): boolean {
  if (address === null || address === undefined) return true;
  if (typeof address !== 'string') return false;
  const trimmed = address.trim();
  if (trimmed.length < 5) return true;
  return PLACEHOLDER_ADDRESS_VALUES.includes(trimmed.toLowerCase() as any);
}

/**
 * Basic address field schema (optional / nullable string).
 * The length / placeholder checks are applied via helpers in the parent schema
 * where we have access to the serviceType field (needed to decide if the
 * address is required).
 */
import { z } from 'zod';
export const AddressSchema = z.string().trim().nullable().optional(); 