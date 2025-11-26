import crypto from 'crypto';

/**
 * Creates and verifies signed tokens for booking payment links.
 *
 * Token format: base64url(JSON(payload)) + '.' + base64url(HMAC_SHA256(payload, secret))
 */

type BookingPaymentTokenPayload = {
  bid: string;   // booking id
  exp: number;   // unix timestamp (seconds)
};

const TOKEN_TTL_SECONDS = 60 * 60 * 24; // 24 hours

function getSecret(): string {
  const secret = process.env.BOOKING_PAYMENT_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('BOOKING_PAYMENT_SECRET (or NEXTAUTH_SECRET) is not configured');
  }
  return secret;
}

function base64UrlEncode(buffer: Buffer): string {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecode(value: string): Buffer {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + pad, 'base64');
}

export function createBookingPaymentToken(bookingId: string, ttlSeconds: number = TOKEN_TTL_SECONDS): string {
  const secret = getSecret();
  const payload: BookingPaymentTokenPayload = {
    bid: bookingId,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const payloadJson = JSON.stringify(payload);
  const payloadB64 = base64UrlEncode(Buffer.from(payloadJson, 'utf8'));
  const hmac = crypto.createHmac('sha256', secret).update(payloadB64).digest();
  const sigB64 = base64UrlEncode(hmac);
  return `${payloadB64}.${sigB64}`;
}

export function verifyBookingPaymentToken(token: string | null | undefined, expectedBookingId: string): boolean {
  if (!token) return false;
  const secret = getSecret();

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const payloadB64 = parts[0];
  const sigB64 = parts[1];

  // Extra runtime safety in case of malformed tokens
  if (!payloadB64 || !sigB64) return false;

  try {
    const payloadBuf = base64UrlDecode(payloadB64);
    const payloadJson = payloadBuf.toString('utf8');
    const payload = JSON.parse(payloadJson) as BookingPaymentTokenPayload;

    if (!payload?.bid || typeof payload.bid !== 'string') return false;
    if (payload.bid !== expectedBookingId) return false;
    if (typeof payload.exp !== 'number' || payload.exp <= Math.floor(Date.now() / 1000)) {
      return false; // expired
    }

    const expectedSig = crypto.createHmac('sha256', secret).update(payloadB64).digest();
    const actualSig = base64UrlDecode(sigB64);

    if (expectedSig.length !== actualSig.length) return false;
    if (!crypto.timingSafeEqual(expectedSig, actualSig)) return false;

    return true;
  } catch {
    return false;
  }
}


