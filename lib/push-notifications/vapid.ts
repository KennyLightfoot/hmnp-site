/**
 * VAPID (Voluntary Application Server Identification) Key Management
 * Used for secure web push notifications
 */

import crypto from 'crypto';

// VAPID Keys for Push Notifications
// In production, these should be generated once and stored securely
export const VAPID_KEYS = {
  // These are placeholder keys - generate real ones in production
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BGxJKZcCOwUc5HBMh4JrO8PsaGCOMZfmOxlEoXfJLMLcqpX7mJyqILPOBvKqVbAAA2Wjz4qO5d1m',
  privateKey: process.env.VAPID_PRIVATE_KEY || 'MRnTxOIqMNOTNfGfWLq7u3H8RlcYbNcxM4TzfIEKzJY',
  email: process.env.VAPID_EMAIL || 'notifications@houstonmobilenotarypros.com'
};

/**
 * Generate new VAPID key pair
 * Run this once and store the keys securely in environment variables
 */
export function generateVAPIDKeys(): { publicKey: string; privateKey: string } {
  const ecdh = crypto.createECDH('prime256v1');
  const privateKey = ecdh.generateKeys();
  const publicKey = ecdh.getPublicKey();

  return {
    publicKey: publicKey.toString('base64url'),
    privateKey: privateKey.toString('base64url')
  };
}

/**
 * Validate VAPID configuration
 */
export function validateVAPIDConfig(): boolean {
  return !!(VAPID_KEYS.publicKey && VAPID_KEYS.privateKey && VAPID_KEYS.email);
}

/**
 * Get VAPID details for web push
 */
export function getVAPIDDetails() {
  if (!validateVAPIDConfig()) {
    throw new Error('VAPID configuration is incomplete. Check environment variables.');
  }

  return {
    subject: `mailto:${VAPID_KEYS.email}`,
    publicKey: VAPID_KEYS.publicKey,
    privateKey: VAPID_KEYS.privateKey
  };
}

/**
 * Convert VAPID public key for client use
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Export for client-side use
if (typeof window !== 'undefined') {
  (window as any).urlBase64ToUint8Array = urlBase64ToUint8Array;
} 