import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthConfig } from '@/lib/auth/unified-middleware';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { withRateLimit } from '@/lib/security/rate-limiting';

/**
 * GET /api/auth/session
 * Returns current session information
 * Requires authentication
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withRateLimit('api_general', 'auth_session_get')(async (request: NextRequest) => {
  return withAuth(request, async ({ user, context }) => {
    if (!context.isAuthenticated) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get fresh session data
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({
      session: {
        user: {
          id: context.userId,
          email: (user as any).email,
          name: (user as any).name,
          role: context.userRole,
        },
        expires: session?.expires,
      },
      lastActivity: new Date().toISOString(),
    });
  }, AuthConfig.authenticated());
})

/**
 * POST /api/auth/session
 * Refresh session and update last activity
 */
export const POST = withRateLimit('api_general', 'auth_session_post')(async (request: NextRequest) => {
  return withAuth(request, async ({ user, context }) => {
    if (!context.isAuthenticated) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
      // Update user's last activity
      await prisma.user.update({
        where: { id: context.userId! },
        data: { 
          updatedAt: new Date(),
          // You can add a lastActivity field to your User model if needed
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Session refreshed',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Session refresh error:', error);
      return NextResponse.json(
        { error: 'Failed to refresh session' },
        { status: 500 }
      );
    }
  }, AuthConfig.authenticated());
})