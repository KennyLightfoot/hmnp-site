/**
 * Environment Configuration Verification Script
 * 
 * This script verifies that all required environment variables are properly
 * configured for the booking system to function correctly in production.
 * 
 * Usage: node scripts/verify-environment-config.js
 */

const requiredEnvVars = {
  // Database Configuration
  'DATABASE_URL': {
    required: true,
    type: 'url',
    description: 'PostgreSQL database connection string',
    example: 'postgresql://user:password@host:port/database',
    validation: (value) => value.startsWith('postgresql://') || value.startsWith('postgres://')
  },

  // Stripe Configuration (Production)
  'STRIPE_SECRET_KEY': {
    required: true,
    type: 'string',
    description: 'Stripe secret key for payment processing',
    example: 'sk_live_...',
    validation: (value) => value.startsWith('sk_live_') || value.startsWith('sk_test_'),
    security: 'SENSITIVE'
  },
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY': {
    required: true,
    type: 'string',
    description: 'Stripe publishable key for frontend',
    example: 'pk_live_...',
    validation: (value) => value.startsWith('pk_live_') || value.startsWith('pk_test_')
  },
  'STRIPE_WEBHOOK_SECRET': {
    required: true,
    type: 'string',
    description: 'Stripe webhook endpoint secret',
    example: 'whsec_...',
    validation: (value) => value.startsWith('whsec_'),
    security: 'SENSITIVE'
  },

  // Application URLs
  'NEXT_PUBLIC_BASE_URL': {
    required: true,
    type: 'url',
    description: 'Base URL for the application',
    example: 'https://houstonmobilenotarypros.com',
    validation: (value) => value.startsWith('https://') && !value.endsWith('/')
  },
  'NEXTAUTH_URL': {
    required: true,
    type: 'url',
    description: 'NextAuth URL for authentication',
    example: 'https://houstonmobilenotarypros.com',
    validation: (value) => value.startsWith('https://') && !value.endsWith('/')
  },

  // Authentication
  'NEXTAUTH_SECRET': {
    required: true,
    type: 'string',
    description: 'NextAuth secret for JWT signing',
    example: 'random-secret-string',
    validation: (value) => value.length >= 32,
    security: 'SENSITIVE'
  },

  // Google Services (Optional but recommended)
  'GOOGLE_MAPS_API_KEY': {
    required: false,
    type: 'string',
    description: 'Google Maps API key for distance calculations',
    example: 'AIza...',
    validation: (value) => value.startsWith('AIza')
  },

  // GHL Integration
  'GHL_LOCATION_ID': {
    required: true,
    type: 'string',
    description: 'GoHighLevel location ID',
    example: 'abc123...'
  },
  'GHL_API_KEY': {
    required: true,
    type: 'string',
    description: 'GoHighLevel API key',
    example: 'eyJ...',
    security: 'SENSITIVE'
  },

  // Environment Detection
  'NODE_ENV': {
    required: true,
    type: 'enum',
    description: 'Node environment',
    allowedValues: ['development', 'production', 'staging'],
    validation: (value) => ['development', 'production', 'staging'].includes(value)
  },
  'DEVELOPMENT_MODE': {
    required: false,
    type: 'boolean',
    description: 'Development mode flag',
    allowedValues: ['true', 'false']
  },

  // Proof.com RON Integration
  'PROOF_API_KEY': {
    required: true,
    type: 'string',
    description: 'Proof.com API key for RON services',
    example: 'proof_live_...',
    security: 'SENSITIVE'
  },
  'PROOF_API_URL': {
    required: false,
    type: 'url',
    description: 'Proof.com API base URL',
    example: 'https://api.proof.com',
    validation: (value) => value.startsWith('https://')
  },
  'PROOF_ORGANIZATION_ID': {
    required: true,
    type: 'string',
    description: 'Proof.com organization identifier',
    example: 'ord123abc456'
  },
  'PROOF_ENVIRONMENT': {
    required: false,
    type: 'enum',
    description: 'Proof.com environment (sandbox or production)',
    allowedValues: ['sandbox', 'production'],
    validation: (value) => ['sandbox', 'production'].includes(value)
  },
  'PROOF_WEBHOOK_SECRET': {
    required: true,
    type: 'string',
    description: 'Proof.com webhook signature verification secret',
    example: 'whsec_...',
    security: 'SENSITIVE'
  },
  'PROOF_REDIRECT_URL': {
    required: false,
    type: 'url',
    description: 'Redirect URL after RON session completion',
    example: 'https://houstonmobilenotarypros.com/ron/complete'
  }
};

function checkEnvironmentVariable(key, config) {
  const value = process.env[key];
  const result = {
    key,
    status: 'UNKNOWN',
    value: config.security === 'SENSITIVE' ? '[REDACTED]' : value,
    issues: []
  };

  // Check if required variable is missing
  if (config.required && !value) {
    result.status = 'MISSING';
    result.issues.push(`Required environment variable ${key} is not set`);
    return result;
  }

  // Skip validation for optional missing variables
  if (!config.required && !value) {
    result.status = 'OPTIONAL_MISSING';
    result.issues.push(`Optional environment variable ${key} is not set`);
    return result;
  }

  // Validate value format
  if (config.validation && !config.validation(value)) {
    result.status = 'INVALID';
    result.issues.push(`Invalid format for ${key}. Expected: ${config.example}`);
    return result;
  }

  // Check allowed values for enums
  if (config.allowedValues && !config.allowedValues.includes(value)) {
    result.status = 'INVALID';
    result.issues.push(`Invalid value for ${key}. Allowed: ${config.allowedValues.join(', ')}`);
    return result;
  }

  // Additional production-specific checks
  if (process.env.NODE_ENV === 'production') {
    // Ensure production uses live Stripe keys
    if (key === 'STRIPE_SECRET_KEY' && !value.startsWith('sk_live_')) {
      result.status = 'WARNING';
      result.issues.push('Using test Stripe key in production environment');
    }
    if (key === 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY' && !value.startsWith('pk_live_')) {
      result.status = 'WARNING';
      result.issues.push('Using test Stripe publishable key in production environment');
    }

    // Ensure HTTPS URLs in production
    if ((key === 'NEXT_PUBLIC_BASE_URL' || key === 'NEXTAUTH_URL') && !value.startsWith('https://')) {
      result.status = 'INVALID';
      result.issues.push('Production URLs must use HTTPS');
    }
  }

  // All checks passed
  if (result.issues.length === 0) {
    result.status = 'VALID';
  }

  return result;
}

function analyzeEnvironment() {
  console.log('🔍 Environment Configuration Analysis');
  console.log('====================================');
  console.log(`Environment: ${process.env.NODE_ENV || 'unknown'}`);
  console.log(`Development Mode: ${process.env.DEVELOPMENT_MODE || 'not set'}\n`);

  const results = [];
  const summary = {
    total: Object.keys(requiredEnvVars).length,
    valid: 0,
    missing: 0,
    invalid: 0,
    warnings: 0,
    optionalMissing: 0
  };

  // Check each environment variable
  Object.entries(requiredEnvVars).forEach(([key, config]) => {
    const result = checkEnvironmentVariable(key, config);
    results.push(result);

    // Update summary
    switch (result.status) {
      case 'VALID':
        summary.valid++;
        break;
      case 'MISSING':
        summary.missing++;
        break;
      case 'INVALID':
        summary.invalid++;
        break;
      case 'WARNING':
        summary.warnings++;
        break;
      case 'OPTIONAL_MISSING':
        summary.optionalMissing++;
        break;
    }

    // Print result
    const statusIcon = {
      'VALID': '✅',
      'MISSING': '❌',
      'INVALID': '🚫',
      'WARNING': '⚠️ ',
      'OPTIONAL_MISSING': '🔸'
    }[result.status];

    console.log(`${statusIcon} ${key}`);
    if (result.issues.length > 0) {
      result.issues.forEach(issue => console.log(`   ${issue}`));
    }
    if (config.description) {
      console.log(`   ${config.description}`);
    }
    console.log();
  });

  return { results, summary };
}

function printSummary(summary) {
  console.log('📊 Configuration Summary');
  console.log('========================');
  console.log(`Total Variables: ${summary.total}`);
  console.log(`✅ Valid: ${summary.valid}`);
  console.log(`❌ Missing (Required): ${summary.missing}`);
  console.log(`🚫 Invalid: ${summary.invalid}`);
  console.log(`⚠️  Warnings: ${summary.warnings}`);
  console.log(`🔸 Optional Missing: ${summary.optionalMissing}`);
}

function generateRecommendations(results) {
  const criticalIssues = results.filter(r => r.status === 'MISSING' || r.status === 'INVALID');
  const warnings = results.filter(r => r.status === 'WARNING');

  if (criticalIssues.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES - Must Fix Before Deployment');
    console.log('===============================================');
    criticalIssues.forEach(result => {
      console.log(`${result.key}:`);
      result.issues.forEach(issue => console.log(`  - ${issue}`));
      console.log();
    });
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS - Should Review');
    console.log('============================');
    warnings.forEach(result => {
      console.log(`${result.key}:`);
      result.issues.forEach(issue => console.log(`  - ${issue}`));
      console.log();
    });
  }

  // Production readiness check
  const isProductionReady = criticalIssues.length === 0;
  
  console.log(`\n🚀 Production Readiness: ${isProductionReady ? '✅ READY' : '❌ NOT READY'}`);
  
  if (!isProductionReady) {
    console.log('\nBefore deploying to production:');
    console.log('1. Fix all critical issues listed above');
    console.log('2. Ensure all Stripe keys are live (not test) keys');
    console.log('3. Verify all URLs use HTTPS');
    console.log('4. Test database connectivity');
    console.log('5. Verify webhook endpoints are configured');
  } else {
    console.log('\n✅ Environment is properly configured for production deployment');
  }
}

function main() {
  try {
    const { results, summary } = analyzeEnvironment();
    printSummary(summary);
    generateRecommendations(results);

    // Exit with error code if critical issues found
    const hasCriticalIssues = results.some(r => r.status === 'MISSING' || r.status === 'INVALID');
    process.exit(hasCriticalIssues ? 1 : 0);

  } catch (error) {
    console.error('💥 Error during environment verification:', error);
    process.exit(1);
  }
}

// Run verification
if (require.main === module) {
  main();
}

module.exports = {
  checkEnvironmentVariable,
  analyzeEnvironment,
  requiredEnvVars
};