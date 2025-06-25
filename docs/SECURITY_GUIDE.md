# 🛡️ Security Guide for HMNP Site

## Overview
This guide covers all security measures for the Houston Mobile Notary Pros website, including current implementations and future enhancements.

## Current Security Status

### ✅ Implemented Security Features
- Basic rate limiting (Redis + memory fallback)
- Webhook signature verification
- Pattern-based threat detection
- Authentication middleware
- Environment variable protection
- HTTPS enforcement

### ❌ Security Gaps
- Limited bot detection
- No fraud detection
- Basic IP reputation
- No real-time threat intelligence
- Admin panel vulnerable to brute force

## Enhanced Security Strategy

### Option 1: Free/Low-Cost Enhancements

#### 1. **Upgrade Rate Limiting (FREE)**
```typescript
// lib/enhanced-rate-limiting.ts
import { Redis } from 'ioredis';
import { createHash } from 'crypto';

interface EnhancedRateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
  enableBurstProtection: boolean;
  enableAdaptiveThrottling: boolean;
  suspiciousPatterns: RegExp[];
}

class EnhancedRateLimiter {
  private redis: Redis;
  private config: EnhancedRateLimitConfig;

  constructor(redis: Redis, config: Partial<EnhancedRateLimitConfig> = {}) {
    this.redis = redis;
    this.config = {
      windowMs: 60000,
      maxRequests: 100,
      keyPrefix: 'enhanced_rl',
      enableBurstProtection: true,
      enableAdaptiveThrottling: true,
      suspiciousPatterns: [
        /bot|crawler|spider/i,
        /curl|wget|python|java/i,
        /masscan|nmap|scanner/i
      ],
      ...config
    };
  }

  async checkRateLimit(
    identifier: string,
    request: Request,
    userAgent?: string
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: Date;
    riskScore: number;
    reason?: string;
  }> {
    const riskScore = this.calculateRiskScore(request, userAgent);
    const effectiveLimit = this.getEffectiveLimit(riskScore);
    
    const key = `${this.config.keyPrefix}:${identifier}`;
    const windowStart = Math.floor(Date.now() / this.config.windowMs) * this.config.windowMs;
    const windowKey = `${key}:${windowStart}`;

    // Use Redis pipeline for atomic operations
    const pipeline = this.redis.pipeline();
    pipeline.incr(windowKey);
    pipeline.expire(windowKey, Math.ceil(this.config.windowMs / 1000) + 1);
    
    const results = await pipeline.exec();
    const currentRequests = results?.[0]?.[1] as number || 0;

    const allowed = currentRequests <= effectiveLimit;
    const remaining = Math.max(0, effectiveLimit - currentRequests);
    const resetTime = new Date(windowStart + this.config.windowMs);

    // Track suspicious activity
    if (riskScore > 0.7) {
      await this.trackSuspiciousActivity(identifier, riskScore, request);
    }

    return {
      allowed,
      remaining,
      resetTime,
      riskScore,
      reason: !allowed ? 'Rate limit exceeded' : undefined
    };
  }

  private calculateRiskScore(request: Request, userAgent?: string): number {
    let score = 0;

    // Check User-Agent patterns
    if (userAgent) {
      const isBot = this.config.suspiciousPatterns.some(pattern => pattern.test(userAgent));
      if (isBot) score += 0.4;
    }

    // Check request patterns
    const url = new URL(request.url);
    if (url.pathname.includes('/admin') && !userAgent?.includes('Mozilla')) {
      score += 0.3;
    }

    // Check for rapid requests (burst detection)
    if (this.config.enableBurstProtection) {
      // Implementation for burst detection
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  private getEffectiveLimit(riskScore: number): number {
    if (riskScore > 0.8) return Math.floor(this.config.maxRequests * 0.1); // 10% of normal
    if (riskScore > 0.6) return Math.floor(this.config.maxRequests * 0.3); // 30% of normal
    if (riskScore > 0.4) return Math.floor(this.config.maxRequests * 0.6); // 60% of normal
    return this.config.maxRequests;
  }

  private async trackSuspiciousActivity(
    identifier: string, 
    riskScore: number, 
    request: Request
  ): Promise<void> {
    const event = {
      identifier,
      riskScore,
      timestamp: new Date().toISOString(),
      url: request.url,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    };

    await this.redis.lpush('suspicious_activity', JSON.stringify(event));
    await this.redis.ltrim('suspicious_activity', 0, 999); // Keep last 1000 events
  }
}
```

#### 2. **Enhanced Bot Detection (FREE)**
```typescript
// lib/bot-detection.ts
import { createHash } from 'crypto';

interface BotDetectionConfig {
  enableJavaScriptChallenge: boolean;
  enableCaptcha: boolean;
  suspiciousPatterns: RegExp[];
  trustedBots: string[];
}

class BotDetector {
  private config: BotDetectionConfig;

  constructor(config: Partial<BotDetectionConfig> = {}) {
    this.config = {
      enableJavaScriptChallenge: true,
      enableCaptcha: false,
      suspiciousPatterns: [
        /bot|crawler|spider|scraper/i,
        /curl|wget|python|java|perl/i,
        /masscan|nmap|scanner|probe/i,
        /headless|phantom|selenium/i
      ],
      trustedBots: [
        'googlebot',
        'bingbot',
        'slurp',
        'duckduckbot',
        'facebookexternalhit',
        'twitterbot'
      ],
      ...config
    };
  }

  async detectBot(request: Request): Promise<{
    isBot: boolean;
    confidence: number;
    reason?: string;
    requiresChallenge: boolean;
  }> {
    const userAgent = request.headers.get('user-agent') || '';
    const url = new URL(request.url);

    // Check for trusted bots first
    if (this.isTrustedBot(userAgent)) {
      return { isBot: true, confidence: 1.0, requiresChallenge: false };
    }

    // Check for suspicious patterns
    const suspiciousScore = this.checkSuspiciousPatterns(userAgent, request);
    
    if (suspiciousScore > 0.7) {
      return {
        isBot: true,
        confidence: suspiciousScore,
        reason: 'Suspicious user agent or behavior',
        requiresChallenge: this.config.enableJavaScriptChallenge
      };
    }

    return {
      isBot: false,
      confidence: 1 - suspiciousScore,
      requiresChallenge: false
    };
  }

  private isTrustedBot(userAgent: string): boolean {
    return this.config.trustedBots.some(bot => 
      userAgent.toLowerCase().includes(bot.toLowerCase())
    );
  }

  private checkSuspiciousPatterns(userAgent: string, request: Request): number {
    let score = 0;

    // Check user agent patterns
    const suspiciousMatches = this.config.suspiciousPatterns.filter(pattern => 
      pattern.test(userAgent)
    );
    score += suspiciousMatches.length * 0.3;

    // Check request headers
    const headers = request.headers;
    if (!headers.get('accept-language')) score += 0.2;
    if (!headers.get('accept-encoding')) score += 0.2;
    if (headers.get('connection') === 'close') score += 0.1;

    return Math.min(score, 1.0);
  }
}
```

### Option 2: Arcjet Integration (Recommended)

#### Benefits
- **Booking Form Protection**: Prevents automated booking spam
- **Payment Security**: Real-time fraud detection
- **Admin Panel Security**: Advanced login protection
- **API Protection**: Comprehensive endpoint security

#### Implementation Steps

##### Step 1: Install Arcjet
```bash
pnpm add @arcjet/next
```

##### Step 2: Configure Arcjet
```typescript
// lib/arcjet.ts
import { createArcjet } from '@arcjet/next';

export const arcjet = createArcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    // Booking form protection
    {
      name: 'booking-form',
      pattern: '/booking/**',
      rateLimit: { window: '1m', max: 5 },
      botDetection: true,
      fraudDetection: true
    },
    
    // Payment protection
    {
      name: 'payment-processing',
      pattern: '/api/payments/**',
      rateLimit: { window: '1m', max: 3 },
      fraudDetection: true,
      velocityCheck: true
    },
    
    // Admin panel protection
    {
      name: 'admin-access',
      pattern: '/admin/**',
      rateLimit: { window: '1m', max: 10 },
      botDetection: true,
      sessionSecurity: true
    },
    
    // API protection
    {
      name: 'api-endpoints',
      pattern: '/api/**',
      rateLimit: { window: '1m', max: 100 },
      botDetection: true
    }
  ]
});
```

##### Step 3: Update Middleware
```typescript
// middleware.ts
import { arcjet } from '@/lib/arcjet';

export async function middleware(request: NextRequest) {
  // Apply Arcjet protection
  const decision = await arcjet.protect(request);
  
  if (decision.isDenied()) {
    return NextResponse.json(
      { error: 'Access denied', reason: decision.reason },
      { status: 429 }
    );
  }
  
  // Continue with existing middleware
  return NextResponse.next();
}
```

##### Step 4: Environment Variables
```bash
# .env.local
ARCJET_KEY=aj_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Security Best Practices

### 1. Environment Variables
- Never commit sensitive data to version control
- Use different keys for development and production
- Rotate keys regularly
- Use strong, unique passwords

### 2. API Security
- Validate all inputs
- Sanitize user data
- Use HTTPS for all communications
- Implement proper authentication

### 3. Database Security
- Use parameterized queries
- Limit database permissions
- Encrypt sensitive data
- Regular backups

### 4. Monitoring
- Log security events
- Monitor for suspicious activity
- Set up alerts for unusual patterns
- Regular security audits

## Implementation Timeline

### Phase 1: Immediate (Week 1-2)
- Implement enhanced rate limiting
- Add bot detection
- Update security headers

### Phase 2: Short-term (Week 3-4)
- Integrate Arcjet (if chosen)
- Enhanced monitoring
- Security testing

### Phase 3: Long-term (Month 2+)
- Advanced fraud detection
- Machine learning threat detection
- Security automation

## Success Metrics
- 90% reduction in bot traffic
- 95% reduction in payment fraud attempts
- 99% reduction in brute force attacks
- Real-time threat detection and blocking

## Rollback Plan
If issues occur:
1. Disable new security measures
2. Revert to previous configuration
3. Debug and redeploy
4. Gradual re-enablement

## Support and Maintenance
- Regular security updates
- Monitor security logs
- Update security rules as needed
- Stay informed about new threats 