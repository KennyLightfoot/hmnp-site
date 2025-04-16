import { randomBytes } from "crypto"

// Generate a CSRF token
export function generateCSRFToken(): string {
  return randomBytes(32).toString("hex")
}

// Validate a CSRF token
export function validateCSRFToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) return false
  return token === storedToken
}

// Store token in a cookie
export function storeCSRFToken(token: string): string {
  return `csrf_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`
}
