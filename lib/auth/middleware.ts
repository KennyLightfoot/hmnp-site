import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db';
import { Role } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  isAuthenticated: true;
}

export interface GuestUser {
  isAuthenticated: false;
  email?: string; // For guest bookings
}

export type AuthenticatedRequest = NextRequest & {
  user: AuthUser | GuestUser;
  auth: {
    isAuthenticated: boolean;
    isGuest: boolean;
    canCreateBooking: boolean;
    canViewOwnBookings: boolean;
    canViewAllBookings: boolean;
    canManageBookings: boolean;
  };
};

/**
 * Unified authentication middleware that handles:
 * - NextAuth sessions (preferred)
 * - Legacy JWT tokens (for API compatibility)
 * - Guest users (for public booking)
 * - Vercel edge runtime compatibility
 */
export async function authMiddleware(
  request: NextRequest,
  options: {
    required?: boolean; // If true, reject unauthenticated requests
    allowGuest?: boolean; // If true, allow guest users for public operations
    roles?: Role[]; // Required roles for access
  } = {}
): Promise<{ user: AuthUser | GuestUser; response?: NextResponse }> {
  
  const { required = false, allowGuest = false, roles = [] } = options;

  try {
    // Try NextAuth first (modern approach)
    const session = await getServerSession(authOptions);
    
    if (session?.user?.id) {
      // Verify user exists in database and get current role
      const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        }
      });

      if (dbUser) {
        const authUser: AuthUser = {
          id: dbUser.id,
          email: dbUser.email!,
          name: dbUser.name,
          role: dbUser.role,
          isAuthenticated: true,
        };

        // Check role requirements
        if (roles.length > 0 && !roles.includes(dbUser.role)) {
          return {
            user: { isAuthenticated: false },
            response: NextResponse.json(
              { error: 'Insufficient permissions', requiredRoles: roles },
              { status: 403 }
            )
          };
        }

        return { user: authUser };
      }
    }

    // Fallback to legacy JWT token (for API compatibility)
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
        
        // Verify user exists in database
        const dbUser = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          }
        });

        if (dbUser) {
          const authUser: AuthUser = {
            id: dbUser.id,
            email: dbUser.email!,
            name: dbUser.name,
            role: dbUser.role,
            isAuthenticated: true,
          };

          // Check role requirements
          if (roles.length > 0 && !roles.includes(dbUser.role)) {
            return {
              user: { isAuthenticated: false },
              response: NextResponse.json(
                { error: 'Insufficient permissions', requiredRoles: roles },
                { status: 403 }
              )
            };
          }

          return { user: authUser };
        }
      } catch (jwtError) {
        console.debug('Invalid JWT token:', jwtError);
        // Continue to guest/unauthenticated flow
      }
    }

    // Handle unauthenticated requests
    if (required && !allowGuest) {
      return {
        user: { isAuthenticated: false },
        response: NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      };
    }

    // Return guest user for public/guest operations
    const guestUser: GuestUser = { isAuthenticated: false };
    return { user: guestUser };

  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (required) {
      return {
        user: { isAuthenticated: false },
        response: NextResponse.json(
          { error: 'Authentication error' },
          { status: 500 }
        )
      };
    }

    return { user: { isAuthenticated: false } };
  }
}

/**
 * Enhanced auth helper that adds authorization context
 */
export function withAuth(user: AuthUser | GuestUser): AuthenticatedRequest['auth'] {
  if (!user.isAuthenticated) {
    return {
      isAuthenticated: false,
      isGuest: true,
      canCreateBooking: true, // Allow guest bookings
      canViewOwnBookings: false,
      canViewAllBookings: false,
      canManageBookings: false,
    };
  }

  const authUser = user as AuthUser;
  const isAdmin = authUser.role === Role.ADMIN;
  const isStaff = authUser.role === Role.STAFF;
  const isNotary = authUser.role === Role.NOTARY;

  return {
    isAuthenticated: true,
    isGuest: false,
    canCreateBooking: true,
    canViewOwnBookings: true,
    canViewAllBookings: isAdmin || isStaff,
    canManageBookings: isAdmin || isStaff || isNotary,
  };
}

/**
 * Environment validation for Vercel deployment
 */
export function validateAuthEnvironment(): void {
  const required = [
    'NEXTAUTH_SECRET',
    'JWT_SECRET',
    'DATABASE_URL'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required auth environment variables: ${missing.join(', ')}`);
  }

  // Warn about optional but recommended vars
  const recommended = [
    'NEXTAUTH_URL',
    'RESEND_API_KEY',
    'FROM_EMAIL'
  ];

  const missingRecommended = recommended.filter(key => !process.env[key]);
  if (missingRecommended.length > 0) {
    console.warn(`Missing recommended auth environment variables: ${missingRecommended.join(', ')}`);
  }
}

/**
 * Quick auth helpers for common patterns
 */
export const Auth = {
  /**
   * Require authentication - reject guests
   */
  required: (roles?: Role[]) => ({ required: true, allowGuest: false, roles }),
  
  /**
   * Allow both authenticated and guest users
   */
  optional: () => ({ required: false, allowGuest: true }),
  
  /**
   * Public endpoints - no auth needed
   */
  public: () => ({ required: false, allowGuest: true }),
  
  /**
   * Admin only
   */
  adminOnly: () => ({ required: true, roles: [Role.ADMIN] }),
  
  /**
   * Staff and admin
   */
  staffOrAdmin: () => ({ required: true, roles: [Role.ADMIN, Role.STAFF] }),
  
  /**
   * Booking management access
   */
  bookingAccess: () => ({ required: true, roles: [Role.ADMIN, Role.STAFF, Role.NOTARY] }),
}; 