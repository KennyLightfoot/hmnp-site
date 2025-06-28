import { z } from 'zod';
import crypto from 'crypto';
import { logger } from '@/lib/logger';

const securityLogger = logger.forService('EnvironmentSecurity');

// Security-focused environment variable validation
export const securityEnvSchema = z.object({
  // Required security keys
  NEXTAUTH_SECRET: z.string()
    .min(32, 'NEXTAUTH_SECRET must be at least 32 characters')
    .refine(
      (secret) => {
        // Check entropy - should have good randomness
        const uniqueChars = new Set(secret).size;
        return uniqueChars >= 16; // At least 16 different characters
      },
      'NEXTAUTH_SECRET should have sufficient entropy (at least 16 unique characters)'
    ),
  
  STRIPE_WEBHOOK_SECRET: z.string()
    .startsWith('whsec_', 'STRIPE_WEBHOOK_SECRET must start with whsec_')
    .min(24, 'STRIPE_WEBHOOK_SECRET must be at least 24 characters'),
  
  STRIPE_SECRET_KEY: z.string()
    .startsWith('sk_', 'STRIPE_SECRET_KEY must start with sk_')
    .refine(
      (key) => key.includes('live') || key.includes('test'),
      'STRIPE_SECRET_KEY must be either live or test key'
    ),
  
  // Database security
  DATABASE_URL: z.string()
    .url('DATABASE_URL must be a valid URL')
    .refine(
      (url) => {
        const parsed = new URL(url);
        // Ensure SSL in production
        if (process.env.NODE_ENV === 'production') {
          return parsed.searchParams.get('sslmode') === 'require' || 
                 parsed.protocol === 'postgres:' && parsed.hostname.includes('aws') ||
                 parsed.hostname.includes('planetscale') ||
                 parsed.hostname.includes('railway') ||
                 parsed.hostname.includes('supabase');
        }
        return true;
      },
      'DATABASE_URL should use SSL in production environments'
    ),
  
  // Redis security
  REDIS_URL: z.string()
    .url('REDIS_URL must be a valid URL')
    .optional()
    .refine(
      (url) => {
        if (!url) return true;
        const parsed = new URL(url);
        // Ensure auth in production
        if (process.env.NODE_ENV === 'production') {
          return parsed.password !== null && parsed.password.length > 0;
        }
        return true;
      },
      'REDIS_URL should include authentication in production'
    ),
  
  // File upload security
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  
  // ClamAV configuration
  CLAMSCAN_PATH: z.string().default('/opt/clamav/bin/clamscan'),
  VIRUS_DEFS_PATH: z.string().default('/opt/clamav/defs'),
  
  // Rate limiting
  RATE_LIMIT_REDIS_URL: z.string().url().optional(),
  
  // Security headers
  SECURITY_HEADERS_ENABLED: z.string().default('true'),
  
  // Monitoring
  SENTRY_DSN: z.string().url().optional(),
  MONITORING_SECRET: z.string().optional(),
  
  // Environment identification
  NODE_ENV: z.enum(['development', 'production', 'test']),
  VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),
});

export interface SecurityValidationResult {
  isSecure: boolean;
  securityScore: number;
  vulnerabilities: SecurityVulnerability[];
  recommendations: string[];
  complianceStatus: ComplianceStatus;
}

export interface SecurityVulnerability {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'authentication' | 'encryption' | 'access_control' | 'monitoring' | 'configuration';
  message: string;
  remediation: string;
}

export interface ComplianceStatus {
  production_ready: boolean;
  security_headers: boolean;
  ssl_enforced: boolean;
  authentication_secure: boolean;
  monitoring_enabled: boolean;
  backup_configured: boolean;
}

export class EnvironmentSecurity {
  
  /**
   * Comprehensive security validation of environment
   */
  static validateSecurityConfiguration(): SecurityValidationResult {
    const vulnerabilities: SecurityVulnerability[] = [];
    const recommendations: string[] = [];
    let securityScore = 100;

    try {
      // Basic schema validation
      const env = securityEnvSchema.parse(process.env);
      
      // Security-specific validations
      this.validateAuthenticationSecurity(env, vulnerabilities, recommendations);
      this.validateDatabaseSecurity(env, vulnerabilities, recommendations);
      this.validateFileUploadSecurity(env, vulnerabilities, recommendations);
      this.validateMonitoringSecurity(env, vulnerabilities, recommendations);
      this.validateProductionReadiness(env, vulnerabilities, recommendations);
      
      // Calculate security score
      securityScore = this.calculateSecurityScore(vulnerabilities);
      
      // Determine compliance status
      const complianceStatus = this.assessComplianceStatus(env, vulnerabilities);
      
      return {
        isSecure: vulnerabilities.filter(v => v.severity === 'critical' || v.severity === 'high').length === 0,
        securityScore,
        vulnerabilities,
        recommendations,
        complianceStatus,
      };
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
          vulnerabilities.push({
            severity: 'critical',
            category: 'configuration',
            message: `Environment variable validation failed: ${err.path.join('.')}: ${err.message}`,
            remediation: 'Fix the environment variable configuration according to the schema requirements',
          });
        });
      }
      
      return {
        isSecure: false,
        securityScore: 0,
        vulnerabilities,
        recommendations: ['Fix all environment variable validation errors before proceeding'],
        complianceStatus: {
          production_ready: false,
          security_headers: false,
          ssl_enforced: false,
          authentication_secure: false,
          monitoring_enabled: false,
          backup_configured: false,
        },
      };
    }
  }

  /**
   * Validate authentication security
   */
  private static validateAuthenticationSecurity(
    env: any,
    vulnerabilities: SecurityVulnerability[],
    recommendations: string[]
  ) {
    // Check NEXTAUTH_SECRET strength
    if (env.NEXTAUTH_SECRET) {
      const secret = env.NEXTAUTH_SECRET;
      
      // Check for common weak secrets
      const weakSecrets = ['secret', 'password', '123456', 'changeme', 'default'];
      if (weakSecrets.some(weak => secret.toLowerCase().includes(weak))) {
        vulnerabilities.push({
          severity: 'critical',
          category: 'authentication',
          message: 'NEXTAUTH_SECRET appears to contain common weak patterns',
          remediation: 'Generate a cryptographically secure random secret',
        });
      }
      
      // Check entropy
      const entropy = this.calculateEntropy(secret);
      if (entropy < 4.0) {
        vulnerabilities.push({
          severity: 'high',
          category: 'authentication',
          message: `NEXTAUTH_SECRET has low entropy (${entropy.toFixed(2)})`,
          remediation: 'Use a secret with higher randomness and character diversity',
        });
      }
    }
    
    // Check Stripe key environment consistency
    if (env.STRIPE_SECRET_KEY && env.NODE_ENV === 'production') {
      if (!env.STRIPE_SECRET_KEY.includes('live')) {
        vulnerabilities.push({
          severity: 'critical',
          category: 'configuration',
          message: 'Using test Stripe keys in production environment',
          remediation: 'Switch to live Stripe keys for production deployment',
        });
      }
    }
  }

  /**
   * Validate database security
   */
  private static validateDatabaseSecurity(
    env: any,
    vulnerabilities: SecurityVulnerability[],
    recommendations: string[]
  ) {
    if (env.DATABASE_URL) {
      const dbUrl = new URL(env.DATABASE_URL);
      
      // Check for SSL in production
      if (env.NODE_ENV === 'production') {
        const sslMode = dbUrl.searchParams.get('sslmode');
        if (sslMode !== 'require' && !dbUrl.hostname.includes('planetscale')) {
          vulnerabilities.push({
            severity: 'high',
            category: 'encryption',
            message: 'Database connection does not enforce SSL in production',
            remediation: 'Add ?sslmode=require to DATABASE_URL or use a provider that enforces SSL',
          });
        }
      }
      
      // Check for database credentials exposure
      if (dbUrl.password && dbUrl.password.length < 12) {
        vulnerabilities.push({
          severity: 'medium',
          category: 'authentication',
          message: 'Database password appears to be weak (less than 12 characters)',
          remediation: 'Use a stronger database password with at least 12 characters',
        });
      }
    }
  }

  /**
   * Validate file upload security
   */
  private static validateFileUploadSecurity(
    env: any,
    vulnerabilities: SecurityVulnerability[],
    recommendations: string[]
  ) {
    // Check if ClamAV is configured
    if (!env.CLAMSCAN_PATH || !env.VIRUS_DEFS_PATH) {
      vulnerabilities.push({
        severity: 'medium',
        category: 'access_control',
        message: 'Virus scanning is not properly configured',
        remediation: 'Configure CLAMSCAN_PATH and VIRUS_DEFS_PATH for file upload security',
      });
    }
    
    // Check AWS S3 configuration
    if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
      if (env.AWS_SECRET_ACCESS_KEY.length < 20) {
        vulnerabilities.push({
          severity: 'medium',
          category: 'authentication',
          message: 'AWS secret access key appears to be invalid or weak',
          remediation: 'Verify AWS credentials are valid and properly configured',
        });
      }
    } else if (env.NODE_ENV === 'production') {
      recommendations.push('Consider configuring AWS S3 for secure file storage in production');
    }
  }

  /**
   * Validate monitoring security
   */
  private static validateMonitoringSecurity(
    env: any,
    vulnerabilities: SecurityVulnerability[],
    recommendations: string[]
  ) {
    // Check for monitoring configuration
    if (!env.SENTRY_DSN && env.NODE_ENV === 'production') {
      vulnerabilities.push({
        severity: 'low',
        category: 'monitoring',
        message: 'Error monitoring is not configured for production',
        remediation: 'Configure Sentry or another error monitoring service',
      });
    }
    
    // Check for monitoring secret
    if (!env.MONITORING_SECRET && env.NODE_ENV === 'production') {
      recommendations.push('Consider adding a monitoring secret for secure health check endpoints');
    }
  }

  /**
   * Validate production readiness
   */
  private static validateProductionReadiness(
    env: any,
    vulnerabilities: SecurityVulnerability[],
    recommendations: string[]
  ) {
    if (env.NODE_ENV === 'production') {
      // Check for development-only configurations
      if (env.SKIP_ENV_VALIDATION === 'true') {
        vulnerabilities.push({
          severity: 'high',
          category: 'configuration',
          message: 'Environment validation is disabled in production',
          remediation: 'Remove SKIP_ENV_VALIDATION or set it to false in production',
        });
      }
      
      // Check for debug configurations
      if (env.ANALYZE === 'true') {
        vulnerabilities.push({
          severity: 'low',
          category: 'configuration',
          message: 'Bundle analyzer is enabled in production',
          remediation: 'Disable ANALYZE in production builds',
        });
      }
      
      // Ensure security headers are enabled
      if (env.SECURITY_HEADERS_ENABLED !== 'true') {
        vulnerabilities.push({
          severity: 'medium',
          category: 'access_control',
          message: 'Security headers are not enabled',
          remediation: 'Set SECURITY_HEADERS_ENABLED=true to enable security headers',
        });
      }
    }
  }

  /**
   * Calculate security score based on vulnerabilities
   */
  private static calculateSecurityScore(vulnerabilities: SecurityVulnerability[]): number {
    let score = 100;
    
    vulnerabilities.forEach(vuln => {
      switch (vuln.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 8;
          break;
        case 'low':
          score -= 3;
          break;
      }
    });
    
    return Math.max(0, score);
  }

  /**
   * Assess compliance status
   */
  private static assessComplianceStatus(
    env: any,
    vulnerabilities: SecurityVulnerability[]
  ): ComplianceStatus {
    const critical = vulnerabilities.filter(v => v.severity === 'critical').length;
    const high = vulnerabilities.filter(v => v.severity === 'high').length;
    
    return {
      production_ready: critical === 0 && high <= 1,
      security_headers: env.SECURITY_HEADERS_ENABLED === 'true',
      ssl_enforced: this.isSSLEnforced(env),
      authentication_secure: this.isAuthenticationSecure(env, vulnerabilities),
      monitoring_enabled: !!env.SENTRY_DSN,
      backup_configured: this.isBackupConfigured(env),
    };
  }

  /**
   * Check if SSL is properly enforced
   */
  private static isSSLEnforced(env: any): boolean {
    if (env.NODE_ENV !== 'production') return true;
    
    try {
      const dbUrl = new URL(env.DATABASE_URL);
      const sslMode = dbUrl.searchParams.get('sslmode');
      return sslMode === 'require' || dbUrl.hostname.includes('planetscale') || dbUrl.hostname.includes('supabase');
    } catch {
      return false;
    }
  }

  /**
   * Check if authentication is secure
   */
  private static isAuthenticationSecure(env: any, vulnerabilities: SecurityVulnerability[]): boolean {
    const authVulns = vulnerabilities.filter(v => 
      v.category === 'authentication' && (v.severity === 'critical' || v.severity === 'high')
    );
    return authVulns.length === 0;
  }

  /**
   * Check if backup is configured
   */
  private static isBackupConfigured(env: any): boolean {
    return !!(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY && env.AWS_S3_BUCKET);
  }

  /**
   * Calculate Shannon entropy for password strength
   */
  private static calculateEntropy(text: string): number {
    const frequency: Record<string, number> = {};
    
    for (const char of text) {
      frequency[char] = (frequency[char] || 0) + 1;
    }
    
    let entropy = 0;
    const length = text.length;
    
    for (const count of Object.values(frequency)) {
      const probability = count / length;
      entropy -= probability * Math.log2(probability);
    }
    
    return entropy;
  }

  /**
   * Generate secure environment template
   */
  static generateSecureEnvTemplate(): string {
    const template = `# Security Environment Configuration Template
# Generated by Houston Mobile Notary Pros Security System

# Database Configuration
DATABASE_URL=postgresql://username:password@host:5432/database?sslmode=require

# Authentication
NEXTAUTH_SECRET=${this.generateSecureSecret(64)}
NEXTAUTH_URL=https://yourdomain.com

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Go High Level
GHL_LOCATION_ID=your_location_id
GHL_PRIVATE_INTEGRATION_TOKEN=your_private_token

# Email Service
RESEND_API_KEY=re_...

# File Storage & Security
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your-secure-bucket

# Virus Scanning
CLAMSCAN_PATH=/opt/clamav/bin/clamscan
VIRUS_DEFS_PATH=/opt/clamav/defs

# Redis/Caching
REDIS_URL=redis://username:password@host:6379

# Monitoring
SENTRY_DSN=https://...
MONITORING_SECRET=${this.generateSecureSecret(32)}

# Security Configuration
SECURITY_HEADERS_ENABLED=true
RATE_LIMIT_REDIS_URL=redis://username:password@host:6379

# Environment
NODE_ENV=production
VERCEL_ENV=production
`;
    
    return template;
  }

  /**
   * Generate cryptographically secure secret
   */
  private static generateSecureSecret(length: number = 32): string {
    return crypto.randomBytes(length).toString('base64').slice(0, length);
  }

  /**
   * Audit environment for security issues and log results
   */
  static auditEnvironmentSecurity(): void {
    const result = this.validateSecurityConfiguration();
    
    logger.info('Environment security audit completed', {
      securityScore: result.securityScore,
      isSecure: result.isSecure,
      vulnerabilityCount: result.vulnerabilities.length,
      complianceStatus: result.complianceStatus,
    });
    
    if (result.vulnerabilities.length > 0) {
      logger.warn('Security vulnerabilities detected', {
        vulnerabilities: result.vulnerabilities,
      });
    }
    
    if (result.recommendations.length > 0) {
      logger.info('Security recommendations', {
        recommendations: result.recommendations,
      });
    }
    
    // Alert on critical security issues
    const criticalVulns = result.vulnerabilities.filter(v => v.severity === 'critical');
    if (criticalVulns.length > 0) {
      logger.error('CRITICAL SECURITY VULNERABILITIES DETECTED', {
        criticalVulnerabilities: criticalVulns,
        securityScore: result.securityScore,
      });
    }
  }
}

// Perform security audit on import in development
if (process.env.NODE_ENV === 'development') {
  EnvironmentSecurity.auditEnvironmentSecurity();
}

export default EnvironmentSecurity;