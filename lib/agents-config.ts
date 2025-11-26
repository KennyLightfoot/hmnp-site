/**
 * HMNP Agents Service Configuration
 *
 * Central place to resolve how the Next.js app talks to the external
 * `agents` service (local + cloud LLM pipeline).
 *
 * In dev this defaults to the local agents server:
 *   http://localhost:4001
 *
 * In production/staging, set:
 *   AGENTS_BASE_URL=https://agents.yourdomain.com
 */

const rawBaseUrl =
  process.env.AGENTS_BASE_URL ||
  process.env.NEXT_PUBLIC_AGENTS_BASE_URL ||
  'http://localhost:4001';

/**
 * Normalized base URL for the agents HTTP server, with no trailing slash.
 *
 * Example: http://localhost:4001
 */
export const AGENTS_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

/**
 * Convenience helper to build full agent URLs.
 */
export function buildAgentsUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${AGENTS_BASE_URL}${normalizedPath}`;
}


