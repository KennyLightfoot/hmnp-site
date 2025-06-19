/**
 * Advanced Security System
 * Provides comprehensive security features including IP filtering, attack detection, and security monitoring
 */

import { logger } from '../logger';
import { cache } from '../cache';
import { monitoring } from '../monitoring';
import { NextRequest } from 'next/server';

export interface SecurityEvent {
  type: 'SUSPICIOUS_ACTIVITY' | 'BLOCKED_IP' | 'RATE_LIMIT_EXCEEDED' | 'FAILED_AUTH' | 'INJECTION_ATTEMPT';
  ip: string;
  userAgent?: string;
  endpoint?: string;
  payload?: any;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: Date;
  blocked: boolean;
}

export interface IPAnalysis {
  ip: string;
  isBlocked: boolean;
  trustLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'BLOCKED';
  requestCount: number;
  failedAttempts: number;
  lastActivity: Date;
  country?: string;
  asn?: string;
}

class AdvancedSecurity {
  private suspiciousPatterns = [
    // SQL Injection patterns
    /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bDELETE\b|\bDROP\b|\bTABLE\b)/i,
    /(\'\s*OR\s*\'\s*=\s*\'|\'\s*OR\s*1\s*=\s*1)/i,
    /(--|\#|\/\*)/,
    
    // XSS patterns
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /javascript:/i,
    /on\w+\s*=/i,
    
    // Path traversal
    /(\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e%5c)/i,
    
    // Command injection
    /(\||\&|\;|\$\(|\`)/,
    /(curl|wget|nc|netcat|bash|sh|cmd|powershell)/i,
    
    // Generic suspicious patterns
    /eval\s*\(/i,
    /base64_decode/i,
    /exec\s*\(/i
  ];

  private blockedIPs = new Set<string>();
  private ipAnalytics = new Map<string, IPAnalysis>();

  /**
   * Main security middleware
   */
  async analyzeRequest(request: NextRequest): Promise<{
    allowed: boolean;
    reason?: string;
    severity?: SecurityEvent['severity'];
  }> {
    const ip = this.getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';
    const url = request.url;
    const method = request.method;

    // Update IP analytics
    await this.updateIPAnalytics(ip, userAgent);

    // Check if IP is blocked
    if (this.isIPBlocked(ip)) {
      await this.logSecurityEvent({
        type: 'BLOCKED_IP',
        ip,
        userAgent,
        endpoint: url,
        severity: 'HIGH',
        timestamp: new Date(),
        blocked: true
      });
      return { allowed: false, reason: 'IP blocked', severity: 'HIGH' };
    }

    // Check rate limits
    const rateLimitCheck = await this.checkRateLimit(ip, url);
    if (!rateLimitCheck.allowed) {
      await this.logSecurityEvent({
        type: 'RATE_LIMIT_EXCEEDED',
        ip,
        userAgent,
        endpoint: url,
        severity: 'MEDIUM',
        timestamp: new Date(),
        blocked: true
      });
      return { allowed: false, reason: 'Rate limit exceeded', severity: 'MEDIUM' };
    }

    // Analyze request for suspicious patterns
    const suspiciousCheck = await this.detectSuspiciousActivity(request);
    if (suspiciousCheck.suspicious) {
      await this.logSecurityEvent({
        type: 'SUSPICIOUS_ACTIVITY',
        ip,
        userAgent,
        endpoint: url,
        payload: suspiciousCheck.evidence,
        severity: suspiciousCheck.severity,
        timestamp: new Date(),
        blocked: suspiciousCheck.severity === 'CRITICAL'
      });

      if (suspiciousCheck.severity === 'CRITICAL') {
        await this.blockIP(ip, 'Automatic block due to critical security threat');
        return { allowed: false, reason: 'Suspicious activity detected', severity: 'CRITICAL' };
      }
    }

    return { allowed: true };
  }

  /**
   * Detect suspicious activity in request
   */
  private async detectSuspiciousActivity(request: NextRequest): Promise<{
    suspicious: boolean;
    severity: SecurityEvent['severity'];
    evidence?: any;
  }> {
    const url = request.url;
    const headers = Object.fromEntries(request.headers.entries());
    
    let body: string = '';
    try {
      if (request.body && request.method !== 'GET') {
        body = await request.text();
      }
    } catch (error) {
      // Body already consumed or not available
    }

    const searchText = `${url} ${JSON.stringify(headers)} ${body}`.toLowerCase();
    
    // Check for injection patterns
    const matchedPatterns = this.suspiciousPatterns.filter(pattern => 
      pattern.test(searchText)
    );

    if (matchedPatterns.length > 0) {
      const severity: SecurityEvent['severity'] = matchedPatterns.length >= 3 ? 'CRITICAL' :
                                                 matchedPatterns.length >= 2 ? 'HIGH' :
                                                 'MEDIUM';
      
      return {
        suspicious: true,
        severity,
        evidence: {
          matchedPatterns: matchedPatterns.length,
          url,
          suspiciousHeaders: this.filterSuspiciousHeaders(headers)
        }
      };
    }

    // Check for unusual request patterns
    const unusualPatterns = [
      // Excessive headers
      Object.keys(headers).length > 50,
      // Unusual user agents
      headers['user-agent']?.length > 500,
      // Multiple suspicious header combinations
      headers['x-forwarded-for'] && headers['x-real-ip'] && headers['cf-connecting-ip']
    ];

    if (unusualPatterns.some(Boolean)) {
      return {
        suspicious: true,
        severity: 'LOW',
        evidence: { unusualHeaders: true }
      };
    }

    return { suspicious: false, severity: 'LOW' };
  }

  /**
   * Rate limiting with adaptive thresholds
   */
  private async checkRateLimit(ip: string, endpoint: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: Date;
  }> {
    const ipAnalysis = this.ipAnalytics.get(ip);
    
    // Adaptive rate limits based on trust level
    const limits = {
      HIGH: { requests: 1000, window: 3600 },    // 1000/hour
      MEDIUM: { requests: 500, window: 3600 },   // 500/hour
      LOW: { requests: 100, window: 3600 },      // 100/hour
      BLOCKED: { requests: 0, window: 3600 }     // 0/hour
    };

    const trustLevel = ipAnalysis?.trustLevel || 'MEDIUM';
    const limit = limits[trustLevel];

    const key = `ratelimit:${ip}:${endpoint}`;
    const current = await cache.increment(key, limit.window);

    const remaining = Math.max(0, limit.requests - current);
    const resetTime = new Date(Date.now() + limit.window * 1000);

    return {
      allowed: current <= limit.requests,
      remaining,
      resetTime
    };
  }

  /**
   * Update IP analytics and trust scoring
   */
  private async updateIPAnalytics(ip: string, userAgent: string) {
    let analysis = this.ipAnalytics.get(ip) || {
      ip,
      isBlocked: false,
      trustLevel: 'MEDIUM' as const,
      requestCount: 0,
      failedAttempts: 0,
      lastActivity: new Date(),
      country: undefined,
      asn: undefined
    };

    analysis.requestCount++;
    analysis.lastActivity = new Date();

    // Calculate trust level based on activity patterns
    const hoursSinceFirst = Math.max(1, (Date.now() - analysis.lastActivity.getTime()) / (1000 * 60 * 60));
    const requestRate = analysis.requestCount / hoursSinceFirst;

    if (analysis.failedAttempts > 10) {
      analysis.trustLevel = 'BLOCKED';
    } else if (analysis.failedAttempts > 5 || requestRate > 100) {
      analysis.trustLevel = 'LOW';
    } else if (analysis.failedAttempts < 2 && requestRate < 10) {
      analysis.trustLevel = 'HIGH';
    } else {
      analysis.trustLevel = 'MEDIUM';
    }

    this.ipAnalytics.set(ip, analysis);

    // Cache the analysis
    await cache.set(`ip:analysis:${ip}`, analysis, { ttl: 3600 });
  }

  /**
   * Block IP address
   */
  async blockIP(ip: string, reason: string, duration?: number) {
    this.blockedIPs.add(ip);
    
    const blockKey = `blocked:ip:${ip}`;
    await cache.set(blockKey, { reason, timestamp: new Date() }, { 
      ttl: duration || 86400 // 24 hours default
    });

    // Update IP analysis
    const analysis = this.ipAnalytics.get(ip);
    if (analysis) {
      analysis.isBlocked = true;
      analysis.trustLevel = 'BLOCKED';
      this.ipAnalytics.set(ip, analysis);
    }

    logger.warn('IP address blocked', 'SECURITY', {
      ip,
      reason,
      duration: duration || 86400
    });

    // Send security alert
    monitoring.sendAlert({
      level: 'warning',
      title: 'IP Address Blocked',
      message: `IP ${ip} has been blocked: ${reason}`,
      context: { ip, reason, duration }
    });
  }

  /**
   * Check if IP is blocked
   */
  private isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  /**
   * Log security events
   */
  private async logSecurityEvent(event: SecurityEvent) {
    logger.warn('Security event detected', 'SECURITY', event);

    // Store in cache for analysis
    const eventKey = `security:event:${Date.now()}:${Math.random()}`;
    await cache.set(eventKey, event, { ttl: 604800 }); // Keep for 7 days

    // Send alerts for high severity events
    if (event.severity === 'HIGH' || event.severity === 'CRITICAL') {
      monitoring.sendAlert({
        level: event.severity === 'CRITICAL' ? 'error' : 'warning',
        title: `Security Alert: ${event.type}`,
        message: `Security event from IP ${event.ip}: ${event.type}`,
        context: event,
        notifyEmail: event.severity === 'CRITICAL'
      });
    }
  }

  /**
   * Get client IP address
   */
  private getClientIP(request: NextRequest): string {
    // Check various headers for the real IP
    const headers = [
      'cf-connecting-ip',     // Cloudflare
      'x-forwarded-for',      // Standard proxy header
      'x-real-ip',            // Nginx
      'x-client-ip',          // Apache
      'true-client-ip'        // Cloudflare Enterprise
    ];

    for (const header of headers) {
      const value = request.headers.get(header);
      if (value) {
        // Take the first IP if there are multiple
        const ip = value.split(',')[0].trim();
        if (this.isValidIP(ip)) {
          return ip;
        }
      }
    }

    // Fallback to connection IP (may not work in serverless)
    return '127.0.0.1'; // Default fallback
  }

  /**
   * Validate IP address format
   */
  private isValidIP(ip: string): boolean {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  /**
   * Filter suspicious headers
   */
  private filterSuspiciousHeaders(headers: Record<string, string>) {
    const suspicious = {};
    const suspiciousHeaderNames = [
      'x-forwarded-for',
      'x-real-ip', 
      'user-agent',
      'referer',
      'x-requested-with'
    ];

    suspiciousHeaderNames.forEach(name => {
      if (headers[name]) {
        suspicious[name] = headers[name];
      }
    });

    return suspicious;
  }

  /**
   * Record failed authentication attempt
   */
  async recordFailedAuth(ip: string, username?: string) {
    const analysis = this.ipAnalytics.get(ip);
    if (analysis) {
      analysis.failedAttempts++;
      this.ipAnalytics.set(ip, analysis);
    }

    await this.logSecurityEvent({
      type: 'FAILED_AUTH',
      ip,
      payload: { username },
      severity: 'MEDIUM',
      timestamp: new Date(),
      blocked: false
    });

    // Auto-block after multiple failed attempts
    if (analysis && analysis.failedAttempts >= 10) {
      await this.blockIP(ip, 'Too many failed authentication attempts');
    }
  }

  /**
   * Get security analytics
   */
  async getSecurityAnalytics(hours = 24) {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    // Get recent security events from cache
    const eventKeys = await cache.client?.keys('security:event:*') || [];
    const events: SecurityEvent[] = [];
    
    for (const key of eventKeys) {
      const event = await cache.get(key);
      if (event && event.timestamp > cutoff) {
        events.push(event);
      }
    }

    // Analyze events
    const eventsByType = events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const eventsBySeverity = events.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topOffendingIPs = events
      .reduce((acc, event) => {
        acc[event.ip] = (acc[event.ip] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return {
      totalEvents: events.length,
      eventsByType,
      eventsBySeverity,
      topOffendingIPs: Object.entries(topOffendingIPs)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10),
      blockedIPs: Array.from(this.blockedIPs),
      timeRange: { start: cutoff, end: new Date() }
    };
  }

  /**
   * Initialize security system
   */
  async initialize() {
    // Load blocked IPs from cache
    const blockedIPKeys = await cache.client?.keys('blocked:ip:*') || [];
    for (const key of blockedIPKeys) {
      const ip = key.replace('blocked:ip:', '');
      this.blockedIPs.add(ip);
    }

    logger.info('Advanced security system initialized', 'SECURITY', {
      blockedIPs: this.blockedIPs.size,
      patterns: this.suspiciousPatterns.length
    });
  }
}

export const advancedSecurity = new AdvancedSecurity(); 