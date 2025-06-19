/**
 * Security Enhancements
 */

import { logger } from './logger';
import { cache } from './cache';
import { NextRequest } from 'next/server';

export interface SecurityCheck {
  allowed: boolean;
  reason?: string;
  blocked?: boolean;
}

class SecurityEnhancer {
  private suspiciousPatterns = [
    /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bDROP\b)/i,
    /(\'\s*OR\s*\'\s*=\s*\')/i,
    /<script[\s\S]*?>/gi,
    /javascript:/i,
    /(\.\.\/|%2e%2e%2f)/i
  ];

  private blockedIPs = new Set<string>();

  async checkRequest(request: NextRequest): Promise<SecurityCheck> {
    const ip = this.getClientIP(request);
    const url = request.url;

    // Check if IP is blocked
    if (this.isIPBlocked(ip)) {
      logger.warn('Blocked IP attempted access', 'SECURITY', { ip, url });
      return { allowed: false, reason: 'IP blocked', blocked: true };
    }

    // Check rate limit
    const rateLimitKey = `rateLimit:${ip}`;
    const currentCount = await cache.increment(rateLimitKey, 3600); // 1 hour window

    if (currentCount > 1000) { // 1000 requests per hour
      logger.warn('Rate limit exceeded', 'SECURITY', { ip, count: currentCount });
      return { allowed: false, reason: 'Rate limit exceeded' };
    }

    // Check for suspicious patterns
    const suspicious = await this.detectSuspiciousActivity(request);
    if (suspicious) {
      logger.warn('Suspicious activity detected', 'SECURITY', { ip, url });
      
      // Auto-block for severe threats
      await this.recordSuspiciousActivity(ip);
      return { allowed: false, reason: 'Suspicious activity detected' };
    }

    return { allowed: true };
  }

  private async detectSuspiciousActivity(request: NextRequest): Promise<boolean> {
    const url = request.url;
    const userAgent = request.headers.get('user-agent') || '';
    
    // Check URL and headers for suspicious patterns
    const searchText = `${url} ${userAgent}`.toLowerCase();
    
    return this.suspiciousPatterns.some(pattern => pattern.test(searchText));
  }

  private async recordSuspiciousActivity(ip: string) {
    const key = `suspicious:${ip}`;
    const count = await cache.increment(key, 3600);
    
    if (count >= 5) {
      await this.blockIP(ip, 'Multiple suspicious activities');
    }
  }

  private async blockIP(ip: string, reason: string) {
    this.blockedIPs.add(ip);
    await cache.set(`blocked:${ip}`, { reason, timestamp: new Date() }, { ttl: 86400 });
    
    logger.error('IP blocked', 'SECURITY', { ip, reason });
  }

  private isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  private getClientIP(request: NextRequest): string {
    return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
           request.headers.get('x-real-ip') ||
           '127.0.0.1';
  }

  async getSecurityStats() {
    return {
      blockedIPs: Array.from(this.blockedIPs),
      totalBlocked: this.blockedIPs.size,
      patternsChecked: this.suspiciousPatterns.length
    };
  }
}

export const securityEnhancer = new SecurityEnhancer(); 