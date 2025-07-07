/**
 * Application Startup Validation
 * Houston Mobile Notary Pros
 * 
 * CRITICAL: This module detects environment variable corruption during
 * application startup and provides early warning of production issues.
 * 
 * Import this module early in your application to catch corruption before
 * it causes API failures.
 */

import { detectEnvironmentCorruption, validateCriticalEnvVars, ENV } from './env-clean';

/**
 * Comprehensive startup validation
 * Call this during application initialization
 */
export function validateApplicationStartup(): {
  isValid: boolean;
  criticalIssues: string[];
  warnings: string[];
} {
  const criticalIssues: string[] = [];
  const warnings: string[] = [];
  
  console.log('🔍 Houston Mobile Notary Pros - Startup Validation');
  console.log('================================================');
  
  // 1. Environment variable corruption check
  console.log('1. Checking environment variable integrity...');
  detectEnvironmentCorruption();
  
  const envValidation = validateCriticalEnvVars();
  if (!envValidation.isValid) {
    Object.entries(envValidation.results).forEach(([varName, result]) => {
      if (!result.isValid) {
        criticalIssues.push(`Environment variable ${varName} is corrupted: ${result.issues.join(', ')}`);
      }
    });
  }
  
  // 2. Critical configuration checks
  console.log('2. Validating critical configurations...');
  
  // NODE_ENV validation
  if (ENV.NODE_ENV !== 'production' && ENV.NODE_ENV !== 'development' && ENV.NODE_ENV !== 'test') {
    criticalIssues.push(`NODE_ENV has invalid value: "${ENV.NODE_ENV}"`);
  }
  
  if (ENV.NODE_ENV?.includes('\n') || ENV.NODE_ENV?.includes('\r')) {
    criticalIssues.push(`NODE_ENV contains line break characters: "${ENV.NODE_ENV}"`);
  }
  
  // Stripe validation
  if (!ENV.STRIPE_SECRET_KEY) {
    criticalIssues.push('STRIPE_SECRET_KEY is missing');
  } else if (!ENV.STRIPE_SECRET_KEY.startsWith('sk_')) {
    criticalIssues.push('STRIPE_SECRET_KEY appears to be invalid (should start with sk_)');
  }
  
  if (!ENV.STRIPE_WEBHOOK_SECRET) {
    warnings.push('STRIPE_WEBHOOK_SECRET is missing - webhook validation will fail');
  } else if (!ENV.STRIPE_WEBHOOK_SECRET.startsWith('whsec_')) {
    warnings.push('STRIPE_WEBHOOK_SECRET appears to be invalid (should start with whsec_)');
  }
  
  // Google Maps validation
  if (!ENV.GOOGLE_MAPS_API_KEY) {
    criticalIssues.push('GOOGLE_MAPS_API_KEY is missing');
  } else if (!ENV.GOOGLE_MAPS_API_KEY.startsWith('AIza')) {
    criticalIssues.push('GOOGLE_MAPS_API_KEY appears to be invalid (should start with AIza)');
  }
  
  if (!ENV.GOOGLE_MAPS_CLIENT_KEY) {
    warnings.push('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is missing - client-side maps may not work');
  }
  
  // Database validation
  if (!ENV.DATABASE_URL) {
    criticalIssues.push('DATABASE_URL is missing');
  }
  
  // 3. Production-specific checks
  if (ENV.NODE_ENV === 'production') {
    console.log('3. Running production-specific validations...');
    
    if (ENV.STRIPE_SECRET_KEY?.includes('test') || ENV.STRIPE_SECRET_KEY?.includes('sk_test_')) {
      criticalIssues.push('Production environment is using test Stripe keys');
    }
    
    if (!ENV.STRIPE_WEBHOOK_SECRET) {
      criticalIssues.push('Production environment missing Stripe webhook secret');
    }
    
    if (!ENV.GHL_WEBHOOK_SECRET) {
      warnings.push('GHL_WEBHOOK_SECRET missing - GHL integrations may fail');
    }
  }
  
  // 4. Report results
  const isValid = criticalIssues.length === 0;
  
  if (isValid) {
    console.log('✅ Startup validation completed successfully');
    if (warnings.length > 0) {
      console.log('⚠️  Warnings detected:');
      warnings.forEach(warning => console.log(`   - ${warning}`));
    }
  } else {
    console.error('❌ CRITICAL startup validation failures:');
    criticalIssues.forEach(issue => console.error(`   - ${issue}`));
    
    if (warnings.length > 0) {
      console.warn('⚠️  Additional warnings:');
      warnings.forEach(warning => console.warn(`   - ${warning}`));
    }
    
    console.error('');
    console.error('🚨 Application may experience API failures!');
    console.error('   Run the environment variable fix script to resolve these issues.');
  }
  
  console.log('================================================');
  
  return { isValid, criticalIssues, warnings };
}

/**
 * Express/Next.js middleware for startup validation
 */
export function createStartupValidationMiddleware() {
  let validationRun = false;
  
  return (req: any, res: any, next: any) => {
    if (!validationRun) {
      const validation = validateApplicationStartup();
      
      if (!validation.isValid) {
        // Log critical issues but don't block the application
        console.error('🚨 Starting application with environment variable issues');
        console.error('   This may cause API failures in production');
      }
      
      validationRun = true;
    }
    
    if (next) next();
  };
}

/**
 * Runtime environment check - can be called anytime
 */
export function checkRuntimeEnvironment(): boolean {
  try {
    const validation = validateCriticalEnvVars();
    return validation.isValid;
  } catch (error) {
    console.error('Runtime environment check failed:', error);
    return false;
  }
}

// Auto-run validation in production
if (typeof window === 'undefined' && ENV.NODE_ENV === 'production') {
  // Server-side only, auto-validate on import
  validateApplicationStartup();
}