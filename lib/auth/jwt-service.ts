import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { redis } from '@/lib/redis';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class JWTService {
  private static readonly ACCESS_TOKEN_TTL = 15 * 60; // 15 minutes
  private static readonly REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days
  private static readonly JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret';
  private static readonly REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-fallback-secret';

  /**
   * Generate access and refresh token pair
   */
  static async generateTokenPair(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<TokenPair> {
    const sessionId = payload.sessionId || this.generateSessionId();
    
    // Generate access token (short-lived)
    const accessToken = jwt.sign(
      { ...payload, sessionId },
      this.JWT_SECRET,
      { expiresIn: this.ACCESS_TOKEN_TTL }
    );

    // Generate refresh token (longer-lived)
    const refreshToken = jwt.sign(
      { userId: payload.userId, sessionId, type: 'refresh' },
      this.REFRESH_SECRET,
      { expiresIn: this.REFRESH_TOKEN_TTL }
    );

    // Store refresh token in Redis with expiration
    const refreshKey = `refresh_token:${sessionId}`;
    await redis.setex(refreshKey, this.REFRESH_TOKEN_TTL, JSON.stringify({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      createdAt: new Date().toISOString()
    }));

    return {
      accessToken,
      refreshToken,
      expiresIn: this.ACCESS_TOKEN_TTL
    };
  }

  /**
   * Verify access token
   */
  static async verifyAccessToken(token: string): Promise<JWTPayload | null> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as JWTPayload;
      
      // Check if session is still valid
      const sessionKey = `refresh_token:${decoded.sessionId}`;
      const sessionExists = await redis.exists(sessionKey);
      
      if (!sessionExists) {
        return null; // Session invalidated
      }

      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(refreshToken: string): Promise<TokenPair | null> {
    try {
      const decoded = jwt.verify(refreshToken, this.REFRESH_SECRET) as any;
      
      if (decoded.type !== 'refresh') {
        return null;
      }

      // Get session data from Redis
      const sessionKey = `refresh_token:${decoded.sessionId}`;
      const sessionData = await redis.get(sessionKey);
      
      if (!sessionData) {
        return null; // Session expired or invalidated
      }

      const session = JSON.parse(sessionData);
      
      // Generate new token pair with rotation
      const newSessionId = this.generateSessionId();
      const newTokenPair = await this.generateTokenPair({
        userId: session.userId,
        email: session.email,
        role: session.role,
        sessionId: newSessionId
      });

      // Invalidate old refresh token
      await redis.del(sessionKey);

      return newTokenPair;
    } catch (error) {
      return null;
    }
  }

  /**
   * Revoke all tokens for a user
   */
  static async revokeAllTokens(userId: string): Promise<void> {
    // Find all refresh tokens for this user
    const pattern = 'refresh_token:*';
    const keys = await redis.keys(pattern);
    
    for (const key of keys) {
      const sessionData = await redis.get(key);
      if (sessionData) {
        const session = JSON.parse(sessionData);
        if (session.userId === userId) {
          await redis.del(key);
        }
      }
    }
  }

  /**
   * Revoke specific session
   */
  static async revokeSession(sessionId: string): Promise<void> {
    const sessionKey = `refresh_token:${sessionId}`;
    await redis.del(sessionKey);
  }

  /**
   * Get active sessions for user
   */
  static async getActiveSessions(userId: string): Promise<Array<{
    sessionId: string;
    createdAt: string;
    expiresAt: string;
  }>> {
    const pattern = 'refresh_token:*';
    const keys = await redis.keys(pattern);
    const sessions = [];
    
    for (const key of keys) {
      const sessionData = await redis.get(key);
      if (sessionData) {
        const session = JSON.parse(sessionData);
        if (session.userId === userId) {
          const ttl = await redis.ttl(key);
          const expiresAt = new Date(Date.now() + (ttl * 1000)).toISOString();
          
          sessions.push({
            sessionId: key.replace('refresh_token:', ''),
            createdAt: session.createdAt,
            expiresAt
          });
        }
      }
    }
    
    return sessions;
  }

  /**
   * Generate session ID
   */
  private static generateSessionId(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Validate token format
   */
  static isValidTokenFormat(token: string): boolean {
    return typeof token === 'string' && token.split('.').length === 3;
  }

  /**
   * Extract payload without verification (for debugging)
   */
  static decodeToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch {
      return null;
    }
  }
} 