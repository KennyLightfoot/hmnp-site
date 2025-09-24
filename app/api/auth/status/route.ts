import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthConfig } from '@/lib/auth/unified-middleware';
import { getUserPermissionSummary } from '@/lib/auth/permissions';
import { withRateLimit } from '@/lib/security/rate-limiting';

/**
 * GET /api/auth/status
 * Returns current authentication status and user permissions
 * Public endpoint - works for both authenticated and guest users
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withRateLimit('public', 'auth_status')(async (request: NextRequest) => {
  return withAuth(request, async ({ user, context }) => {
    const permissionSummary = getUserPermissionSummary(user);
    
    return NextResponse.json({
      isAuthenticated: context.isAuthenticated,
      isGuest: context.isGuest,
      user: context.isAuthenticated ? {
        id: context.userId,
        role: context.userRole,
        email: (user as any).email,
        name: (user as any).name,
      } : null,
      permissions: permissionSummary,
      capabilities: {
        canCreateBooking: context.canCreateBooking,
        canViewOwnBookings: context.canViewOwnBookings,
        canViewAllBookings: context.canViewAllBookings,
        canManageBookings: context.canManageBookings,
        canAccessAdmin: context.canAccessAdmin,
      },
      timestamp: new Date().toISOString(),
    });
  }, AuthConfig.public());
})