import { NextRequest } from 'next/server';

/**
 * Shared secret used by the agents service when calling our webhook endpoints.
 * Falls back to NEXTJS_API_SECRET so we only have to manage one value locally.
 */
const AGENTS_WEBHOOK_SECRET =
  process.env.AGENTS_WEBHOOK_SECRET || process.env.NEXTJS_API_SECRET || '';

/**
 * Extract the bearer/shared secret supplied by the agents service.
 */
function extractProvidedSecret(request: NextRequest): string | null {
  const headerSecret = request.headers.get('x-webhook-secret');
  if (headerSecret) return headerSecret;

  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length).trim();
  }

  return null;
}

/**
 * Verifies that the incoming webhook request includes the configured secret.
 */
export function verifyAgentsWebhook(request: NextRequest): boolean {
  if (!AGENTS_WEBHOOK_SECRET) {
    console.warn(
      '[agents-webhook] Missing AGENTS_WEBHOOK_SECRET/NEXTJS_API_SECRET – rejecting webhook.',
    );
    return false;
  }

  const providedSecret = extractProvidedSecret(request);
  return providedSecret === AGENTS_WEBHOOK_SECRET;
}

export function getAgentsWebhookSecret(): string {
  return AGENTS_WEBHOOK_SECRET;
}

