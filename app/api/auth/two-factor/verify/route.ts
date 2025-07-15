import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthConfig } from '@/lib/auth/unified-middleware';
import { TwoFactorService } from '@/lib/auth/two-factor';
import { RateLimitService } from '@/lib/auth/rate-limit';
import { z } from 'zod';
import { Role } from '@prisma/client';

const verifySchema = z.object({
  token: z.string().trim().min(6, 'Token must be at least 6 characters').max(8, 'Token must be at most 8 characters'),
  enable: z.boolean().default(true)
});

/**
 * POST /api/auth/two-factor/verify
 * Verify 2FA token and enable/disable 2FA for admin users
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async ({ user, context }) => {
    if (!context.isAuthenticated) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Only admins can use 2FA
    if (context.userRole !== Role.ADMIN) {
      return NextResponse.json({ 
        error: 'Two-factor authentication is only available for admin users' 
      }, { status: 403 });
    }

    // Rate limiting for 2FA verification
    const rateLimitResult = await RateLimitService.checkLimit(
      context.userId!,
      'twoFactor'
    );

    if (!rateLimitResult.success) {
      return NextResponse.json({
        error: 'Too many 2FA verification attempts',
        retryAfter: rateLimitResult.resetTime
      }, { status: 429 });
    }

    try {
      const body = await request.json();
      const { token, enable } = verifySchema.parse(body);

      // Enable or disable 2FA based on request
      if (enable) {
        const isEnabled = await TwoFactorService.verifyAndEnable(
          context.userId!,
          token
        );
        
        if (!isEnabled) {
          return NextResponse.json({
            error: 'Invalid 2FA token',
            message: 'Please check your authenticator app or try a backup code'
          }, { status: 400 });
        }
        
        return NextResponse.json({
          success: true,
          message: 'Two-factor authentication has been enabled successfully'
        });
      } else {
        // For disable, we still need to verify the token first
        const verification = await TwoFactorService.verifyToken(
          context.userId!,
          token
        );

        if (!verification.isValid) {
          return NextResponse.json({
            error: 'Invalid 2FA token',
            message: 'Please check your authenticator app or try a backup code'
          }, { status: 400 });
        }

        await TwoFactorService.disable(context.userId!);
        
        return NextResponse.json({
          success: true,
          message: 'Two-factor authentication has been disabled'
        });
      }

    } catch (error) {
      console.error('2FA verification error:', error);

      if (error instanceof z.ZodError) {
        return NextResponse.json({
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        }, { status: 400 });
      }

      return NextResponse.json(
        { error: 'Failed to verify 2FA token' },
        { status: 500 }
      );
    }
  }, AuthConfig.authenticated());
} 