import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export type UserTier = 'anon' | 'auth' | 'premium';

// Placeholder predicate for premium – extend when subscription info available
function isPremium(session: any): boolean {
  if (!session?.user) return false;
  // Check explicit flag or metadata (extend later)
  return Boolean((session.user as any).isPremium || (session.user as any)?.tier === 'premium');
}

/**
 * Classify the current request's user tier.
 * Falls back to 'anon' when no session or errors.
 */
export async function getUserTier(): Promise<UserTier> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return 'anon';
    return isPremium(session) ? 'premium' : 'auth';
  } catch (_) {
    return 'anon';
  }
} 