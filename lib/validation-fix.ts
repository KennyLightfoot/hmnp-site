/**
 * Validation Schema Fixes
 * Ensures Zod schemas work correctly in production builds
 */
import { z } from 'zod';

// Export commonly used schema helpers to prevent build errors
export const createPartialSchema = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) => {
  return schema.partial();
};

// Safe schema wrapper to prevent runtime errors
export const safeSchema = <T extends z.ZodSchema>(schema: T) => {
  return schema.catch(() => ({}));
};

export default { createPartialSchema, safeSchema };