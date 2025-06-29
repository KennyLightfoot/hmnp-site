/**
 * Unified Authentication System
 * 
 * Consolidates all auth implementations into one enterprise-grade system:
 * - NextAuth configuration and providers
 * - JWT token management
 * - Role-based access control
 * - API key authentication
 * - Express and Next.js middleware support
 * - Type-safe auth helpers
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, type NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/db';
import { Resend } from 'resend';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// ===========================================
// TYPES AND INTERFACES
// ===========================================

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  isAuthenticated: true;
}

export interface GuestUser {
  isAuthenticated: false;
  email?: string;
}

export type User = AuthUser | GuestUser;

export interface AuthContext {
  isAuthenticated: boolean;
  isGuest: boolean;
  canCreateBooking: boolean;
  canViewOwnBookings: boolean;
  canViewAllBookings: boolean;
  canManageBookings: boolean;
}

export interface AuthMiddlewareOptions {
  required?: boolean;
  allowGuest?: boolean;
  roles?: Role[];
  allowApiKey?: boolean;
}

export interface JWTPayload {
  id: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

// ===========================================
// NEXTAUTH CONFIGURATION
// ===========================================

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    EmailProvider({
      sendVerificationRequest: async ({ identifier, url }) => {
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #002147;">Houston Mobile Notary Pros</h2>
            <p>Click the button below to sign in to your HMNP Portal:</p>
            <a href="${url}" style="background-color: #A52A2A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Sign In to HMNP Portal
            </a>
            <p style="margin-top: 20px; color: #666;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="color: #666; word-break: break-all;">${url}</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px;">This email was sent by Houston Mobile Notary Pros. If you didn't request this sign-in link, you can safely ignore this email.</p>
          </div>
        `;
        
        try {
          if (!process.env.RESEND_API_KEY) {
            throw new Error('RESEND_API_KEY is not set');
          }
          
          await resend.emails.send({
            to: identifier,
            from: process.env.FROM_EMAIL || 'notifications@houstonmobilenotarypros.com',
            subject: 'Your HMNP Portal Sign-In Link',
            html,
          });
        } catch (err) {
          console.error('[Auth] Failed to send verification email', err);
          throw err;
        }
      },
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error('Email and password required');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          emailVerified: user.emailVerified
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
};

// ===========================================
// JWT TOKEN UTILITIES
// ===========================================

export class TokenManager {
  private static readonly ACCESS_TOKEN_EXPIRY = '1h';
  private static readonly REFRESH_TOKEN_EXPIRY = '7d';
  
  static generateAccessToken(user: AuthUser): string {
    const payload: JWTPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET!, { 
      expiresIn: this.ACCESS_TOKEN_EXPIRY 
    });
  }
  
  static generateRefreshToken(userId: string): string {
    return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET!, { 
      expiresIn: this.REFRESH_TOKEN_EXPIRY 
    });
  }
  
  static verifyAccessToken(token: string): JWTPayload {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  }
  
  static verifyRefreshToken(token: string): { id: string } {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { id: string };
  }
  
  static async generateTokenPair(user: AuthUser): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user.id);
    
    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt
      }
    });
    
    return { accessToken, refreshToken };
  }
}

// ===========================================
// UNIFIED AUTH MIDDLEWARE
// ===========================================

export class UnifiedAuth {
  /**
   * Main authentication middleware for Next.js API routes and middleware
   */
  static async authenticate(
    request: NextRequest,
    options: AuthMiddlewareOptions = {}
  ): Promise<{ user: User; response?: NextResponse }> {
    
    const { required = false, allowGuest = false, roles = [], allowApiKey = false } = options;

    try {
      // Try NextAuth session first (preferred method)
      const session = await getServerSession(authOptions);
      
      if (session?.user?.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { id: true, email: true, name: true, role: true }
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

      // Try JWT token authentication (for API compatibility)
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        
        try {
          const decoded = TokenManager.verifyAccessToken(token);
          
          const dbUser = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, name: true, role: true }
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
        }
      }

      /*
       * API Key Authentication (Future Implementation)
       * 
       * API key authentication will be available once the ApiKey model is added to the schema.
       * This would allow system integrations to authenticate using x-api-key headers.
       * 
       * Implementation would include:
       * - Validate API key against database
       * - Check key is active and not expired
       * - Return system user context for valid keys
       */

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

      // Return guest user for public operations
      return { user: { isAuthenticated: false } };

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
   * Express middleware adapter for legacy API routes
   */
  static expressMiddleware(options: AuthMiddlewareOptions = {}) {
    return async (req: any, res: any, next: any) => {
      try {
        // Create a mock NextRequest from Express request
        const url = new URL(req.url, `http://${req.headers.host}`);
        const headers = new Headers();
        Object.entries(req.headers).forEach(([key, value]) => {
          headers.set(key, value as string);
        });
        
        const mockRequest = new NextRequest(url, { headers });
        
        const { user, response } = await this.authenticate(mockRequest, options);
        
        if (response) {
          // Convert NextResponse to Express response
          const body = await response.json();
          return res.status(response.status).json(body);
        }
        
        // Add user to request object
        req.user = user;
        req.auth = this.createAuthContext(user);
        
        next();
      } catch (error) {
        console.error('Express auth middleware error:', error);
        res.status(500).json({ error: 'Authentication error' });
      }
    };
  }

  /**
   * Create authorization context for authenticated users
   */
  static createAuthContext(user: User): AuthContext {
    if (!user.isAuthenticated) {
      return {
        isAuthenticated: false,
        isGuest: true,
        canCreateBooking: true,
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
}

// ===========================================
// AUTH HELPERS AND SHORTCUTS
// ===========================================

export const Auth = {
  /**
   * Require authentication - reject guests
   */
  required: (roles?: Role[]): AuthMiddlewareOptions => ({ 
    required: true, 
    allowGuest: false, 
    roles 
  }),
  
  /**
   * Allow both authenticated and guest users
   */
  optional: (): AuthMiddlewareOptions => ({ 
    required: false, 
    allowGuest: true 
  }),
  
  /**
   * Public endpoints - no auth needed
   */
  public: (): AuthMiddlewareOptions => ({ 
    required: false, 
    allowGuest: true 
  }),
  
  /**
   * Admin only access
   */
  adminOnly: (): AuthMiddlewareOptions => ({ 
    required: true, 
    roles: [Role.ADMIN] 
  }),
  
  /**
   * Staff and admin access
   */
  staffOrAdmin: (): AuthMiddlewareOptions => ({ 
    required: true, 
    roles: [Role.ADMIN, Role.STAFF] 
  }),
  
  /**
   * Booking management access
   */
  bookingAccess: (): AuthMiddlewareOptions => ({ 
    required: true, 
    roles: [Role.ADMIN, Role.STAFF, Role.NOTARY] 
  }),

  /**
   * API key authentication for system integrations
   */
  apiKeyOnly: (): AuthMiddlewareOptions => ({
    required: true,
    allowGuest: false,
    allowApiKey: true
  }),
};

// ===========================================
// CONVENIENCE FUNCTIONS
// ===========================================

/**
 * Get current session (server-side)
 */
export async function getSession() {
  return getServerSession(authOptions);
}

/**
 * Get current user (server-side)
 */
export async function getUser(): Promise<AuthUser | null> {
  const session = await getSession();
  if (!session?.user?.id) return null;
  
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, role: true }
  });
  
  if (!dbUser) return null;
  
  return {
    id: dbUser.id,
    email: dbUser.email!,
    name: dbUser.name,
    role: dbUser.role,
    isAuthenticated: true,
  };
}

/**
 * Check if user is authenticated (server-side)
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return Boolean(session?.user?.id);
}

/**
 * Environment validation
 */
export function validateAuthEnvironment(): void {
  const required = [
    'NEXTAUTH_SECRET',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'DATABASE_URL'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required auth environment variables: ${missing.join(', ')}`);
  }

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

// Export main auth configuration and utilities
export { authOptions as default };

// Re-export client-side auth functions
export { signIn, signOut } from 'next-auth/react';