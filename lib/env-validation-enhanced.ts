/**
 * Enhanced Environment Variable Validation
 * 
 * Prevents environment variable corruption issues like trailing newlines
 * that can cause Authorization header failures in production.
 */

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate and clean Stripe environment variables
 */
export function validateStripeEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check Stripe Secret Key
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    errors.push('STRIPE_SECRET_KEY is required');
  } else {
    // Check for common corruption issues
    if (secretKey.includes('\\n')) {
      errors.push('STRIPE_SECRET_KEY contains literal \\n characters');
    }
    if (secretKey.includes('\n')) {
      errors.push('STRIPE_SECRET_KEY contains actual newline characters');
    }
    if (secretKey.trim() !== secretKey) {
      warnings.push('STRIPE_SECRET_KEY has leading/trailing whitespace');
    }
    if (!secretKey.startsWith('sk_')) {
      errors.push('STRIPE_SECRET_KEY should start with "sk_"');
    }
    if (secretKey.length < 50) {
      warnings.push('STRIPE_SECRET_KEY appears to be too short');
    }
  }
  
  // Check Publishable Key
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    warnings.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
  } else {
    if (publishableKey.includes('\\n') || publishableKey.includes('\n')) {
      errors.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY contains newline characters');
    }
    if (!publishableKey.startsWith('pk_')) {
      errors.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY should start with "pk_"');
    }
  }
  
  // Check Webhook Secret
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    warnings.push('STRIPE_WEBHOOK_SECRET is not set');
  } else {
    if (webhookSecret.includes('\\n') || webhookSecret.includes('\n')) {
      errors.push('STRIPE_WEBHOOK_SECRET contains newline characters');
    }
    if (!webhookSecret.startsWith('whsec_')) {
      errors.push('STRIPE_WEBHOOK_SECRET should start with "whsec_"');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Clean environment variable of common corruption issues
 */
export function cleanEnvironmentVariable(value: string | undefined): string | undefined {
  if (!value) return value;
  
  return value
    .trim() // Remove leading/trailing whitespace
    .replace(/^["']|["']$/g, '') // Remove surrounding quotes
    .replace(/\\n/g, '') // Remove literal \n
    .replace(/\n/g, '') // Remove actual newlines
    .replace(/\r/g, ''); // Remove carriage returns
}

/**
 * Get cleaned Stripe environment variables
 */
export function getCleanStripeEnvironment() {
  return {
    secretKey: cleanEnvironmentVariable(process.env.STRIPE_SECRET_KEY),
    publishableKey: cleanEnvironmentVariable(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
    webhookSecret: cleanEnvironmentVariable(process.env.STRIPE_WEBHOOK_SECRET),
  };
}

/**
 * Validate all critical environment variables
 */
export function validateCriticalEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validate Stripe
  const stripeValidation = validateStripeEnvironment();
  errors.push(...stripeValidation.errors);
  warnings.push(...stripeValidation.warnings);
  
  // Check Database URL
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    errors.push('DATABASE_URL is required');
  } else if (databaseUrl.includes('\\n') || databaseUrl.includes('\n')) {
    errors.push('DATABASE_URL contains newline characters');
  }
  
  // Check NextAuth Secret
  const nextAuthSecret = process.env.NEXTAUTH_SECRET;
  if (!nextAuthSecret) {
    errors.push('NEXTAUTH_SECRET is required');
  } else if (nextAuthSecret.includes('\\n') || nextAuthSecret.includes('\n')) {
    errors.push('NEXTAUTH_SECRET contains newline characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Log environment validation results
 */
export function logEnvironmentValidation() {
  const validation = validateCriticalEnvironment();
  
  if (validation.isValid) {
    console.log('[ENV_VALIDATION] ✅ All critical environment variables are valid');
  } else {
    console.error('[ENV_VALIDATION] ❌ Environment validation failed:');
    validation.errors.forEach(error => {
      console.error(`  - ERROR: ${error}`);
    });
  }
  
  if (validation.warnings.length > 0) {
    console.warn('[ENV_VALIDATION] ⚠️ Environment warnings:');
    validation.warnings.forEach(warning => {
      console.warn(`  - WARNING: ${warning}`);
    });
  }
  
  return validation;
}

// Auto-validate on import in development
if (process.env.NODE_ENV === 'development') {
  logEnvironmentValidation();
}