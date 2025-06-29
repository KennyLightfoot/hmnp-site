import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthConfig, validateAuthEnvironment } from '@/lib/auth/unified-middleware';
import { prisma } from '@/lib/db';

/**
 * GET /api/auth/test
 * Test auth system functionality - Public endpoint
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async ({ user, context }) => {
    try {
      // Test database connectivity
      const userCount = await prisma.user.count();

      // Test environment configuration
      let envStatus = 'OK';
      try {
        validateAuthEnvironment();
      } catch (envError) {
        envStatus = `ERROR: ${envError}`;
      }

      // Test auth status
      const authTest = {
        isAuthenticated: context.isAuthenticated,
        userRole: context.userRole || 'GUEST',
        capabilities: {
          canCreateBooking: context.canCreateBooking,
          canViewAllBookings: context.canViewAllBookings,
          canAccessAdmin: context.canAccessAdmin,
        },
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json({
        status: 'OK',
        message: 'Auth system is working correctly',
        tests: {
          database: {
            status: 'OK',
            userCount,
          },
          environment: {
            status: envStatus,
          },
          authentication: authTest,
        },
        version: '1.0.0',
      });

    } catch (error) {
      console.error('Auth test error:', error);
      return NextResponse.json({
        status: 'ERROR',
        message: 'Auth system test failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }
  }, AuthConfig.public());
}

/**
 * POST /api/auth/test
 * Test specific auth scenarios - Requires authentication
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async ({ user, context }) => {
    if (!context.isAuthenticated) {
      return NextResponse.json({ error: 'Authentication required for this test' }, { status: 401 });
    }

    try {
      const body = await request.json();
      const testType = body.testType || "standard-notary";

      let testResults: any = {
        testType,
        user: {
          id: context.userId,
          role: context.userRole,
          isAuthenticated: context.isAuthenticated,
        },
        timestamp: new Date().toISOString(),
      };

      switch (testType) {
        case 'permissions':
          testResults.permissions = {
            canCreateBooking: context.canCreateBooking,
            canViewOwnBookings: context.canViewOwnBookings,
            canViewAllBookings: context.canViewAllBookings,
            canManageBookings: context.canManageBookings,
            canAccessAdmin: context.canAccessAdmin,
          };
          break;

        case 'database':
          // Test user's bookings
          const userBookings = await prisma.booking.count({
            where: { signerId: context.userId! }
          });
          testResults.database = {
            userBookings,
            canAccessDatabase: true,
          };
          break;

        case 'session':
          // Test session data
          testResults.session = {
            userId: context.userId,
            userRole: context.userRole,
            sessionValid: true,
          };
          break;

        default:
          testResults.basic = {
            authenticationWorking: true,
            userIdPresent: !!context.userId,
            roleAssigned: !!context.userRole,
          };
      }

      return NextResponse.json({
        status: 'OK',
        message: `Auth test '${testType}' completed successfully`,
        results: testResults,
      });

    } catch (error) {
      console.error('Auth POST test error:', error);
      return NextResponse.json({
        status: 'ERROR',
        message: 'Auth test failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      }, { status: 500 });
    }
  }, AuthConfig.authenticated());
} 