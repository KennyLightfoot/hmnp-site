// Central PII Scrubber for prompts, logs, metrics
// -------------------------------------------------
// Replaces personally-identifiable information (PII) such as e-mail, phone,
// US zip codes, SSN, and credit-card numbers with the placeholder "[REDACTED]".
//
// • The scrubber is enabled by default in all environments *except* development.
//   Disable explicitly by setting `DISABLE_PII_SCRUB=true`.
// • Intended for lightweight, best-effort redaction – not a guarantee of full
//   anonymization. Extend patterns as necessary.

import { cleanEnvVar } from '@/lib/env-clean';

const DISABLED = cleanEnvVar(process.env.DISABLE_PII_SCRUB) === 'true' || process.env.NODE_ENV === 'development';

// Regex patterns
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g; // US phone formats
const ZIP_REGEX   = /\b\d{5}(?:-\d{4})?\b/g;                                   // 5-digit (or ZIP+4)
const SSN_REGEX   = /\b\d{3}-?\d{2}-?\d{4}\b/g;                                // SSN 000-00-0000
const CC_REGEX    = /\b(?:\d[ -]*?){13,19}\b/g;                                  // 13-19 digit sequences

const patterns: RegExp[] = [EMAIL_REGEX, PHONE_REGEX, ZIP_REGEX, SSN_REGEX, CC_REGEX];

/**
 * Scrub PII from arbitrary text.
 * Falls back to returning original text if scrubber is disabled.
 */
export function scrubPII(input: string): string {
  if (DISABLED || !input) return input;

  let output = input;
  for (const pattern of patterns) {
    output = output.replace(pattern, '[REDACTED]');
  }
  return output;
} 