import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthConfig } from '@/lib/auth/unified-middleware';
import { hasPermission, hasAnyPermission, Actions, Resources } from '@/lib/auth/permissions';
import { z } from 'zod';
import { withRateLimit } from '@/lib/security/rate-limiting';

// Permission check schema
const permissionCheckSchema = z.object({
  action: z.enum(['create', 'read', 'update', 'delete', 'manage', 'assign', 'approve', 'cancel', 'refund']),
  resource: z.enum([
    'booking', 'user', 'service', 'promo_code', 'business_settings', 
    'calendar', 'payment', 'notification', 'report', 'admin_panel',
    'assignment', 'document'
  ]),
  resourceData: z.any().optional(),
});

const bulkPermissionCheckSchema = z.object({
  permissions: z.array(permissionCheckSchema),
  requireAll: z.boolean().default(false), // If true, user must have ALL permissions
});

/**
 * GET /api/auth/permissions
 * Get all permissions for current user
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withRateLimit('public', 'auth_permissions_get')(async (request: NextRequest) => {
  return withAuth(request, async ({ user, context }) => {
    const { searchParams } = new URL(request.url);
    const detailed = searchParams.get('detailed') === 'true';

    // Basic permission summary
    const basicPermissions = {
      role: context.isAuthenticated ? context.userRole : 'GUEST',
      isAuthenticated: context.isAuthenticated,
      capabilities: {
        canCreateBooking: context.canCreateBooking,
        canViewOwnBookings: context.canViewOwnBookings,
        canViewAllBookings: context.canViewAllBookings,
        canManageBookings: context.canManageBookings,
        canAccessAdmin: context.canAccessAdmin,
      }
    };

    if (!detailed) {
      return NextResponse.json(basicPermissions);
    }

    // Detailed permission matrix
    const detailedPermissions = {
      ...basicPermissions,
      permissions: {
        booking: {
          create: hasPermission(user, Actions.CREATE, Resources.BOOKING),
          read: hasPermission(user, Actions.READ, Resources.BOOKING),
          update: hasPermission(user, Actions.UPDATE, Resources.BOOKING),
          delete: hasPermission(user, Actions.DELETE, Resources.BOOKING),
          manage: hasPermission(user, Actions.MANAGE, Resources.BOOKING),
          cancel: hasPermission(user, Actions.CANCEL, Resources.BOOKING),
        },
        user: {
          create: hasPermission(user, Actions.CREATE, Resources.USER),
          read: hasPermission(user, Actions.READ, Resources.USER),
          update: hasPermission(user, Actions.UPDATE, Resources.USER),
          delete: hasPermission(user, Actions.DELETE, Resources.USER),
          manage: hasPermission(user, Actions.MANAGE, Resources.USER),
        },
        service: {
          create: hasPermission(user, Actions.CREATE, Resources.SERVICE),
          read: hasPermission(user, Actions.READ, Resources.SERVICE),
          update: hasPermission(user, Actions.UPDATE, Resources.SERVICE),
          manage: hasPermission(user, Actions.MANAGE, Resources.SERVICE),
        },
        admin: {
          access: hasPermission(user, Actions.READ, Resources.ADMIN_PANEL),
          manageSettings: hasPermission(user, Actions.MANAGE, Resources.BUSINESS_SETTINGS),
          viewReports: hasPermission(user, Actions.READ, Resources.REPORT),
        },
        assignment: {
          read: hasPermission(user, Actions.READ, Resources.ASSIGNMENT),
          update: hasPermission(user, Actions.UPDATE, Resources.ASSIGNMENT),
          manage: hasPermission(user, Actions.MANAGE, Resources.ASSIGNMENT),
        },
        document: {
          read: hasPermission(user, Actions.READ, Resources.DOCUMENT),
          manage: hasPermission(user, Actions.MANAGE, Resources.DOCUMENT),
        }
      }
    };

    return NextResponse.json(detailedPermissions);
  }, AuthConfig.public());
})

/**
 * POST /api/auth/permissions/check
 * Check specific permissions
 */
export const POST = withRateLimit('api_general', 'auth_permissions_post')(async (request: NextRequest) => {
  return withAuth(request, async ({ user, context }) => {
    try {
      const body = await request.json();
      
      // Handle single permission check
      if (body.action && body.resource) {
        const validatedData = permissionCheckSchema.parse(body);
        
        const hasAccess = hasPermission(
          user,
          validatedData.action as Actions,
          validatedData.resource as Resources,
          validatedData.resourceData
        );

        return NextResponse.json({
          hasPermission: hasAccess,
          action: validatedData.action,
          resource: validatedData.resource,
          user: {
            isAuthenticated: context.isAuthenticated,
            role: context.userRole,
          }
        });
      }

      // Handle bulk permission check
      if (body.permissions) {
        const validatedData = bulkPermissionCheckSchema.parse(body);
        
        const permissionResults = validatedData.permissions.map(perm => ({
          action: perm.action,
          resource: perm.resource,
          hasPermission: hasPermission(
            user,
            perm.action as Actions,
            perm.resource as Resources,
            perm.resourceData
          )
        }));

        const hasAccess = validatedData.requireAll
          ? permissionResults.every(result => result.hasPermission)
          : permissionResults.some(result => result.hasPermission);

        return NextResponse.json({
          hasPermission: hasAccess,
          requireAll: validatedData.requireAll,
          results: permissionResults,
          user: {
            isAuthenticated: context.isAuthenticated,
            role: context.userRole,
          }
        });
      }

      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );

    } catch (error) {
      console.error('Permission check error:', error);

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
        { error: 'Permission check failed' },
        { status: 500 }
      );
    }
  }, AuthConfig.public());
})