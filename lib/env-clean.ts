/**
 * Environment Variable Cleaning Utility
 * Houston Mobile Notary Pros
 * 
 * CRITICAL: This utility addresses the persistent production issue where
 * environment variables contain trailing \n characters that break API integrations.
 * 
 * Root Cause: Shell scripts and environment sync processes have been adding
 * trailing newlines to environment variables, causing:
 * - Stripe: "Invalid character in header content" errors
 * - Google Maps: "REQUEST_DENIED" errors  
 * - NODE_ENV: Shows as "production\n" instead of "production"
 */

/**
 * Clean environment variable by removing all forms of whitespace corruption
 */
export function cleanEnvVar(value: string | undefined): string | undefined {
  if (!value) return value;
  
  return value
    .trim()                          // Remove leading/trailing whitespace
    .replace(/^["']|["']$/g, '')     // Remove surrounding quotes
    .replace(/\\n/g, '')             // Remove literal \n sequences
    .replace(/\n/g, '')              // Remove actual newline characters
    .replace(/\r/g, '')              // Remove carriage returns
    .replace(/\t/g, '')              // Remove tabs
    .replace(/\0/g, '');             // Remove null characters
}

/**
 * Get cleaned environment variable with validation
 */
export function getCleanEnv(key: string): string | undefined {
  const value = process.env[key];
  const cleaned = cleanEnvVar(value);
  
  // Log if cleaning was needed (only in development to avoid log spam)
  if (process.env.NODE_ENV?.includes('development') && value !== cleaned) {
    console.warn(`🧹 Environment variable ${key} was cleaned:`, {
      original: JSON.stringify(value),
      cleaned: JSON.stringify(cleaned)
    });
  }
  
  return cleaned;
}

/**
 * Get required cleaned environment variable with validation
 */
export function getRequiredCleanEnv(key: string, description?: string): string {
  const value = getCleanEnv(key);
  
  if (!value) {
    throw new Error(
      `Environment variable ${key} is required${description ? ` (${description})` : ''}`
    );
  }
  
  return value;
}

/**
 * Validate that an environment variable doesn't contain corruption
 */
export function validateEnvVar(key: string, value?: string): {
  isValid: boolean;
  issues: string[];
  cleanValue?: string;
} {
  const envValue = value || process.env[key];
  const issues: string[] = [];
  
  if (!envValue) {
    return { isValid: true, issues: [] };
  }
  
  // Check for various forms of corruption
  if (envValue.includes('\n')) {
    issues.push('Contains newline characters');
  }
  
  if (envValue.includes('\r')) {
    issues.push('Contains carriage return characters');
  }
  
  if (envValue.includes('\t')) {
    issues.push('Contains tab characters');
  }
  
  if (envValue.includes('\0')) {
    issues.push('Contains null characters');
  }
  
  if (envValue !== envValue.trim()) {
    issues.push('Has leading or trailing whitespace');
  }
  
  if (/^["'].*["']$/.test(envValue) && envValue.length > 2) {
    issues.push('Has unnecessary surrounding quotes');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    cleanValue: cleanEnvVar(envValue)
  };
}

/**
 * Comprehensive environment validation for critical production variables
 */
export function validateCriticalEnvVars(): {
  isValid: boolean;
  results: Record<string, { isValid: boolean; issues: string[]; cleanValue?: string }>;
} {
  const criticalVars = [
    'NODE_ENV',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'GOOGLE_MAPS_API_KEY',
    'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
    'GHL_WEBHOOK_SECRET'
  ];
  
  const results: Record<string, ReturnType<typeof validateEnvVar>> = {};
  let allValid = true;
  
  for (const varName of criticalVars) {
    results[varName] = validateEnvVar(varName);
    if (!results[varName].isValid) {
      allValid = false;
    }
  }
  
  return { isValid: allValid, results };
}

/**
 * Runtime environment variable corruption detector
 * Call this during application startup to detect and log corruption
 */
export function detectEnvironmentCorruption(): void {
  const validation = validateCriticalEnvVars();
  
  if (!validation.isValid) {
    console.error('🚨 CRITICAL: Corrupted environment variables detected!');
    
    Object.entries(validation.results).forEach(([varName, result]) => {
      if (!result.isValid && result.issues.length > 0) {
        console.error(`❌ ${varName}:`, result.issues);
        if (result.cleanValue) {
          console.error(`   Clean value would be: ${JSON.stringify(result.cleanValue)}`);
        }
      }
    });
    
    console.error('');
    console.error('This corruption is likely causing the following production errors:');
    console.error('- Stripe: "Invalid character in header content" errors');
    console.error('- Google Maps: "REQUEST_DENIED" errors');
    console.error('- NODE_ENV: Incorrect environment detection');
    console.error('');
    console.error('To fix: Run the environment variable fix script or manually clean variables in Vercel dashboard');
  } else {
    console.log('✅ All critical environment variables are clean');
  }
}

// Critical environment variables with automatic cleaning
export const ENV = {
  // Node environment
  NODE_ENV: getCleanEnv('NODE_ENV') || 'development',
  
  // Stripe configuration
  STRIPE_SECRET_KEY: getCleanEnv('STRIPE_SECRET_KEY'),
  STRIPE_PUBLISHABLE_KEY: getCleanEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
  STRIPE_WEBHOOK_SECRET: getCleanEnv('STRIPE_WEBHOOK_SECRET'),
  
  // Google Maps configuration
  GOOGLE_MAPS_API_KEY: getCleanEnv('GOOGLE_MAPS_API_KEY'),
  GOOGLE_MAPS_CLIENT_KEY: getCleanEnv('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'),
  
  // GHL configuration
  GHL_WEBHOOK_SECRET: getCleanEnv('GHL_WEBHOOK_SECRET'),
  
  // Database
  DATABASE_URL: getCleanEnv('DATABASE_URL'),
  
  // Redis
  REDIS_URL: getCleanEnv('REDIS_URL'),
} as const;

// Type for environment variables
export type EnvironmentVariables = typeof ENV;