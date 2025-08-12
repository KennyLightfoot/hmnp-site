import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthConfig } from '@/lib/auth/unified-middleware';
import { TwoFactorService } from '@/lib/auth/two-factor';
import { withRateLimit } from '@/lib/security/rate-limiting';
import { Role } from '@prisma/client';

/**
 * GET /api/auth/two-factor/setup
 * Generate 2FA setup (QR code and backup codes) for admin users
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withRateLimit('auth_login', 'two_factor_setup')(async (request: NextRequest) => {
  return withAuth(request, async ({ user, context }) => {
    if (!context.isAuthenticated) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Only admins can set up 2FA
    if (context.userRole !== Role.ADMIN) {
      return NextResponse.json({ 
        error: 'Two-factor authentication is only available for admin users' 
      }, { status: 403 });
    }

    try {
      const authUser = user as any;
      const setup = await TwoFactorService.generateSetup(
        context.userId!,
        authUser.email
      );

      return NextResponse.json({
        success: true,
        setup: {
          qrCodeUrl: setup.qrCodeUrl,
          backupCodes: setup.backupCodes,
          instructions: [
            '1. Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)',
            '2. Enter the 6-digit code from your app to verify setup',
            '3. Save the backup codes in a secure location',
            '4. You can use backup codes if you lose access to your authenticator app'
          ]
        }
      });

    } catch (error) {
      console.error('2FA setup error:', error);
      return NextResponse.json(
        { error: 'Failed to generate 2FA setup' },
        { status: 500 }
      );
    }
  }, AuthConfig.authenticated());
})