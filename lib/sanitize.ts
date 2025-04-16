// Simple input sanitization utility

/**
 * Sanitizes a string input to prevent XSS attacks
 * @param input The string to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (!input) return ""

  // Replace potentially dangerous characters
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
}

/**
 * Sanitizes an object's string properties
 * @param obj The object to sanitize
 * @returns A new object with sanitized string properties
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const result = { ...obj }

  for (const key in result) {
    if (typeof result[key] === "string") {
      result[key] = sanitizeInput(result[key])
    }
  }

  return result
}
