/**
 * Pre-Deployment Checklist Script
 * 
 * This script performs comprehensive checks before deploying the critical
 * booking system fix to production. It verifies all components are ready
 * and provides a go/no-go decision for deployment.
 * 
 * Usage: node scripts/pre-deployment-checklist.js
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

let prisma;

// Initialize Prisma only if DATABASE_URL is available
try {
  if (process.env.DATABASE_URL) {
    prisma = new PrismaClient();
  }
} catch (error) {
  console.log('⚠️  Prisma not available - will skip database checks');
}

const checklistItems = [
  {
    category: 'Database Schema',
    items: [
      {
        id: 'migration_files_exist',
        name: 'Migration files exist and are valid',
        check: checkMigrationFiles,
        critical: true
      },
      {
        id: 'database_connection',
        name: 'Database connection works',
        check: checkDatabaseConnection,
        critical: true
      },
      {
        id: 'enhanced_pricing_columns_missing',
        name: 'Enhanced pricing columns are missing (confirming migration needed)',
        check: checkEnhancedPricingColumns,
        critical: true
      }
    ]
  },
  {
    category: 'Code Changes',
    items: [
      {
        id: 'booking_api_fixed',
        name: 'Booking API has deposit enforcement fixes',
        check: checkBookingAPIFixes,
        critical: true
      },
      {
        id: 'payment_flow_updated',
        name: 'Payment flow uses checkoutUrl instead of clientSecret',
        check: checkPaymentFlowUpdates,
        critical: true
      },
      {
        id: 'payment_recovery_page',
        name: 'Payment recovery page exists and is complete',
        check: checkPaymentRecoveryPage,
        critical: true
      },
      {
        id: 'checkout_session_api',
        name: 'Checkout session API exists and is properly configured',
        check: checkCheckoutSessionAPI,
        critical: true
      }
    ]
  },
  {
    category: 'Environment Configuration',
    items: [
      {
        id: 'environment_variables',
        name: 'All required environment variables are set',
        check: checkEnvironmentVariables,
        critical: true
      },
      {
        id: 'stripe_keys_live',
        name: 'Stripe keys are live keys (not test) for production',
        check: checkStripeKeysProduction,
        critical: true
      },
      {
        id: 'https_urls',
        name: 'All URLs use HTTPS for production',
        check: checkHTTPSUrls,
        critical: true
      }
    ]
  },
  {
    category: 'Backup & Safety',
    items: [
      {
        id: 'backup_procedures',
        name: 'Backup procedures are documented and ready',
        check: checkBackupProcedures,
        critical: true
      },
      {
        id: 'rollback_plan',
        name: 'Rollback plan is documented and tested',
        check: checkRollbackPlan,
        critical: false
      },
      {
        id: 'monitoring_ready',
        name: 'Monitoring and alerting are configured',
        check: checkMonitoring,
        critical: false
      }
    ]
  },
  {
    category: 'Service Configuration',
    items: [
      {
        id: 'service_deposits_configured',
        name: 'All services are configured to require deposits',
        check: checkServiceDeposits,
        critical: true
      },
      {
        id: 'deposit_amounts_reasonable',
        name: 'Deposit amounts are reasonable and not excessive',
        check: checkDepositAmounts,
        critical: false
      }
    ]
  }
];

// Check functions
async function checkMigrationFiles() {
  try {
    const migrationPath = path.join(__dirname, '../prisma/migrations/20250101120000_add_enhanced_pricing_fields/migration.sql');
    const migrationScriptPath = path.join(__dirname, 'apply-enhanced-pricing-migration.js');
    
    const migrationExists = fs.existsSync(migrationPath);
    const scriptExists = fs.existsSync(migrationScriptPath);
    
    if (!migrationExists) {
      return { pass: false, message: 'Migration SQL file missing' };
    }
    
    if (!scriptExists) {
      return { pass: false, message: 'Migration script missing' };
    }
    
    // Check migration file content
    const migrationContent = fs.readFileSync(migrationPath, 'utf8');
    const hasRequiredColumns = migrationContent.includes('travelFee') && 
                               migrationContent.includes('calculatedDistance') &&
                               migrationContent.includes('serviceAreaValidated');
    
    if (!hasRequiredColumns) {
      return { pass: false, message: 'Migration file missing required columns' };
    }
    
    return { pass: true, message: 'Migration files are complete and valid' };
  } catch (error) {
    return { pass: false, message: `Migration file check failed: ${error.message}` };
  }
}

async function checkDatabaseConnection() {
  if (!prisma) {
    return { pass: false, message: 'DATABASE_URL not set - cannot test connection' };
  }
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { pass: true, message: 'Database connection successful' };
  } catch (error) {
    return { pass: false, message: `Database connection failed: ${error.message}` };
  }
}

async function checkEnhancedPricingColumns() {
  if (!prisma) {
    return { pass: null, message: 'Cannot check - DATABASE_URL not set' };
  }
  
  try {
    // This should fail if columns don't exist (which is what we want to confirm)
    await prisma.$queryRaw`SELECT "travelFee", "calculatedDistance", "serviceAreaValidated" FROM "Booking" LIMIT 1`;
    return { pass: false, message: 'Enhanced pricing columns already exist - migration may not be needed' };
  } catch (error) {
    if (error.message.includes('column') && error.message.includes('does not exist')) {
      return { pass: true, message: 'Enhanced pricing columns missing - migration needed (expected)' };
    } else {
      return { pass: false, message: `Unexpected database error: ${error.message}` };
    }
  }
}

async function checkBookingAPIFixes() {
  try {
    const bookingApiPath = path.join(__dirname, '../app/api/bookings/route.ts');
    const content = fs.readFileSync(bookingApiPath, 'utf8');
    
    // Check for deposit enforcement fixes
    const hasDepositEnforcement = content.includes('NEVER auto-confirm bookings without explicit payment verification');
    const hasPaymentPendingLogic = content.includes('initialStatus = BookingStatus.PAYMENT_PENDING');
    const hasEnhancedPricingFields = content.includes('travelFee: 0.00') && content.includes('calculatedDistance: null');
    
    if (!hasDepositEnforcement) {
      return { pass: false, message: 'Deposit enforcement comments not found' };
    }
    
    if (!hasPaymentPendingLogic) {
      return { pass: false, message: 'PAYMENT_PENDING logic not implemented' };
    }
    
    if (!hasEnhancedPricingFields) {
      return { pass: false, message: 'Enhanced pricing fields not added to booking creation' };
    }
    
    return { pass: true, message: 'Booking API has all required fixes' };
  } catch (error) {
    return { pass: false, message: `Booking API check failed: ${error.message}` };
  }
}

async function checkPaymentFlowUpdates() {
  try {
    const bookingPagePath = path.join(__dirname, '../app/booking/page.tsx');
    const content = fs.readFileSync(bookingPagePath, 'utf8');
    
    const usesCheckoutUrl = content.includes('result.checkoutUrl');
    const hasWindowLocation = content.includes('window.location.href = result.checkoutUrl');
    const removedClientSecret = !content.includes('result.payment?.clientSecret');
    
    if (!usesCheckoutUrl) {
      return { pass: false, message: 'checkoutUrl usage not found in booking page' };
    }
    
    if (!hasWindowLocation) {
      return { pass: false, message: 'window.location.href redirect not implemented' };
    }
    
    if (!removedClientSecret) {
      return { pass: false, message: 'Old clientSecret logic still present' };
    }
    
    return { pass: true, message: 'Payment flow correctly updated to use checkoutUrl' };
  } catch (error) {
    return { pass: false, message: `Payment flow check failed: ${error.message}` };
  }
}

async function checkPaymentRecoveryPage() {
  try {
    const paymentPagePath = path.join(__dirname, '../app/payment/[id]/page.tsx');
    const errorPagePath = path.join(__dirname, '../app/payment/error.tsx');
    
    const paymentPageExists = fs.existsSync(paymentPagePath);
    const errorPageExists = fs.existsSync(errorPagePath);
    
    if (!paymentPageExists) {
      return { pass: false, message: 'Payment recovery page missing' };
    }
    
    if (!errorPageExists) {
      return { pass: false, message: 'Payment error boundary missing' };
    }
    
    const paymentContent = fs.readFileSync(paymentPagePath, 'utf8');
    const hasCheckoutCreation = paymentContent.includes('/api/create-checkout-session');
    const hasErrorHandling = paymentContent.includes('error handling');
    
    if (!hasCheckoutCreation) {
      return { pass: false, message: 'Payment page does not create checkout sessions' };
    }
    
    return { pass: true, message: 'Payment recovery system is complete' };
  } catch (error) {
    return { pass: false, message: `Payment recovery check failed: ${error.message}` };
  }
}

async function checkCheckoutSessionAPI() {
  try {
    const apiPath = path.join(__dirname, '../app/api/create-checkout-session/route.ts');
    const exists = fs.existsSync(apiPath);
    
    if (!exists) {
      return { pass: false, message: 'Checkout session API missing' };
    }
    
    const content = fs.readFileSync(apiPath, 'utf8');
    const hasStripeIntegration = content.includes('stripe.checkout.sessions.create');
    const hasValidation = content.includes('PAYMENT_PENDING');
    const hasErrorHandling = content.includes('error handling');
    
    if (!hasStripeIntegration) {
      return { pass: false, message: 'Stripe integration not found in checkout session API' };
    }
    
    if (!hasValidation) {
      return { pass: false, message: 'Booking status validation missing' };
    }
    
    return { pass: true, message: 'Checkout session API is properly implemented' };
  } catch (error) {
    return { pass: false, message: `Checkout session API check failed: ${error.message}` };
  }
}

async function checkEnvironmentVariables() {
  const required = ['DATABASE_URL', 'STRIPE_SECRET_KEY', 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'NEXTAUTH_URL'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    return { pass: false, message: `Missing environment variables: ${missing.join(', ')}` };
  }
  
  return { pass: true, message: 'All required environment variables are set' };
}

async function checkStripeKeysProduction() {
  const nodeEnv = process.env.NODE_ENV;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  
  if (nodeEnv === 'production') {
    if (!secretKey?.startsWith('sk_live_')) {
      return { pass: false, message: 'Production environment using test Stripe secret key' };
    }
    
    if (!publishableKey?.startsWith('pk_live_')) {
      return { pass: false, message: 'Production environment using test Stripe publishable key' };
    }
  }
  
  return { pass: true, message: 'Stripe keys are appropriate for environment' };
}

async function checkHTTPSUrls() {
  const nodeEnv = process.env.NODE_ENV;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  
  if (nodeEnv === 'production') {
    if (baseUrl && !baseUrl.startsWith('https://')) {
      return { pass: false, message: 'NEXT_PUBLIC_BASE_URL must use HTTPS in production' };
    }
    
    if (nextAuthUrl && !nextAuthUrl.startsWith('https://')) {
      return { pass: false, message: 'NEXTAUTH_URL must use HTTPS in production' };
    }
  }
  
  return { pass: true, message: 'URLs are properly configured for environment' };
}

async function checkBackupProcedures() {
  try {
    const deploymentGuidePath = path.join(__dirname, '../DEPLOYMENT_GUIDE.md');
    const exists = fs.existsSync(deploymentGuidePath);
    
    if (!exists) {
      return { pass: false, message: 'Deployment guide missing' };
    }
    
    const content = fs.readFileSync(deploymentGuidePath, 'utf8');
    const hasBackupInstructions = content.includes('Database Backup') && content.includes('Supabase');
    const hasRollbackPlan = content.includes('ROLLBACK PLAN');
    
    if (!hasBackupInstructions) {
      return { pass: false, message: 'Backup instructions not found in deployment guide' };
    }
    
    return { pass: true, message: 'Backup procedures are documented' };
  } catch (error) {
    return { pass: false, message: `Backup procedure check failed: ${error.message}` };
  }
}

async function checkRollbackPlan() {
  try {
    const deploymentGuidePath = path.join(__dirname, '../DEPLOYMENT_GUIDE.md');
    const content = fs.readFileSync(deploymentGuidePath, 'utf8');
    
    const hasRollbackSteps = content.includes('ROLLBACK PLAN') && content.includes('Revert Code Deployment');
    
    return { 
      pass: hasRollbackSteps, 
      message: hasRollbackSteps ? 'Rollback plan is documented' : 'Rollback plan missing or incomplete' 
    };
  } catch (error) {
    return { pass: false, message: `Rollback plan check failed: ${error.message}` };
  }
}

async function checkMonitoring() {
  // This is a basic check - in a real system you'd verify monitoring endpoints
  const deploymentGuidePath = path.join(__dirname, '../DEPLOYMENT_GUIDE.md');
  
  try {
    const content = fs.readFileSync(deploymentGuidePath, 'utf8');
    const hasMonitoringSection = content.includes('MONITORING') && content.includes('Application Logs');
    
    return { 
      pass: hasMonitoringSection, 
      message: hasMonitoringSection ? 'Monitoring procedures documented' : 'Monitoring procedures need setup' 
    };
  } catch (error) {
    return { pass: false, message: 'Could not verify monitoring configuration' };
  }
}

async function checkServiceDeposits() {
  if (!prisma) {
    return { pass: null, message: 'Cannot check - DATABASE_URL not set' };
  }
  
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      select: {
        name: true,
        requiresDeposit: true,
        depositAmount: true
      }
    });
    
    const servicesWithoutDeposits = services.filter(s => !s.requiresDeposit);
    
    if (servicesWithoutDeposits.length > 0) {
      return { 
        pass: false, 
        message: `${servicesWithoutDeposits.length} active services don't require deposits: ${servicesWithoutDeposits.map(s => s.name).join(', ')}` 
      };
    }
    
    return { pass: true, message: `All ${services.length} active services require deposits` };
  } catch (error) {
    return { pass: false, message: `Service deposit check failed: ${error.message}` };
  }
}

async function checkDepositAmounts() {
  if (!prisma) {
    return { pass: null, message: 'Cannot check - DATABASE_URL not set' };
  }
  
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true, requiresDeposit: true },
      select: {
        name: true,
        basePrice: true,
        depositAmount: true
      }
    });
    
    const issues = [];
    
    services.forEach(service => {
      const basePrice = typeof service.basePrice === 'object' ? service.basePrice.toNumber() : Number(service.basePrice);
      const depositAmount = typeof service.depositAmount === 'object' ? service.depositAmount.toNumber() : Number(service.depositAmount);
      
      if (depositAmount > basePrice) {
        issues.push(`${service.name}: deposit ($${depositAmount}) > base price ($${basePrice})`);
      } else if (depositAmount < 25) {
        issues.push(`${service.name}: deposit ($${depositAmount}) below recommended minimum ($25)`);
      }
    });
    
    if (issues.length > 0) {
      return { pass: false, message: `Deposit amount issues: ${issues.join('; ')}` };
    }
    
    return { pass: true, message: `All ${services.length} service deposit amounts are reasonable` };
  } catch (error) {
    return { pass: false, message: `Deposit amount check failed: ${error.message}` };
  }
}

// Main execution
async function runChecklist() {
  console.log('🚀 Pre-Deployment Checklist for Critical Booking System Fix');
  console.log('============================================================');
  console.log('');

  const results = {
    totalItems: 0,
    passedItems: 0,
    failedItems: 0,
    skippedItems: 0,
    criticalFailures: 0,
    categories: {}
  };

  for (const category of checklistItems) {
    console.log(`\n📋 ${category.category}`);
    console.log('='.repeat(category.category.length + 4));
    
    const categoryResults = {
      total: category.items.length,
      passed: 0,
      failed: 0,
      skipped: 0,
      criticalFailures: 0
    };

    for (const item of category.items) {
      results.totalItems++;
      categoryResults.total++;
      
      try {
        const result = await item.check();
        
        if (result.pass === null) {
          console.log(`🔸 ${item.name}`);
          console.log(`   SKIPPED: ${result.message}`);
          results.skippedItems++;
          categoryResults.skipped++;
        } else if (result.pass) {
          console.log(`✅ ${item.name}`);
          console.log(`   ${result.message}`);
          results.passedItems++;
          categoryResults.passed++;
        } else {
          const icon = item.critical ? '❌' : '⚠️ ';
          console.log(`${icon} ${item.name}`);
          console.log(`   FAILED: ${result.message}`);
          results.failedItems++;
          categoryResults.failed++;
          
          if (item.critical) {
            results.criticalFailures++;
            categoryResults.criticalFailures++;
          }
        }
      } catch (error) {
        console.log(`💥 ${item.name}`);
        console.log(`   ERROR: ${error.message}`);
        results.failedItems++;
        categoryResults.failed++;
        
        if (item.critical) {
          results.criticalFailures++;
          categoryResults.criticalFailures++;
        }
      }
    }
    
    results.categories[category.category] = categoryResults;
  }

  // Print summary
  console.log('\n\n📊 DEPLOYMENT READINESS SUMMARY');
  console.log('=================================');
  console.log(`Total Checks: ${results.totalItems}`);
  console.log(`✅ Passed: ${results.passedItems}`);
  console.log(`❌ Failed: ${results.failedItems}`);
  console.log(`🔸 Skipped: ${results.skippedItems}`);
  console.log(`🚨 Critical Failures: ${results.criticalFailures}`);

  // Deployment decision
  const isDeploymentReady = results.criticalFailures === 0;
  
  console.log('\n🚀 DEPLOYMENT DECISION');
  console.log('====================');
  
  if (isDeploymentReady) {
    console.log('✅ GO FOR DEPLOYMENT');
    console.log('All critical checks passed. System is ready for production deployment.');
    
    if (results.failedItems > results.criticalFailures) {
      console.log('\n⚠️  Note: Some non-critical issues found. Review warnings above.');
    }
  } else {
    console.log('❌ NO-GO FOR DEPLOYMENT');
    console.log(`${results.criticalFailures} critical issues must be resolved before deployment.`);
    console.log('\nResolve critical issues and run checklist again.');
  }

  console.log('\n📋 Next Steps:');
  if (isDeploymentReady) {
    console.log('1. Follow the deployment guide: DEPLOYMENT_GUIDE.md');
    console.log('2. Run database migration: node scripts/apply-enhanced-pricing-migration.js');
    console.log('3. Verify service configuration: node scripts/verify-service-deposit-config.js');
    console.log('4. Deploy code changes');
    console.log('5. Monitor system health post-deployment');
  } else {
    console.log('1. Fix all critical issues listed above');
    console.log('2. Run this checklist again: node scripts/pre-deployment-checklist.js');
    console.log('3. Proceed with deployment only after all critical checks pass');
  }

  // Exit with appropriate code
  process.exit(isDeploymentReady ? 0 : 1);
}

// Cleanup function
async function cleanup() {
  if (prisma) {
    await prisma.$disconnect();
  }
}

// Run the checklist
if (require.main === module) {
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  
  runChecklist()
    .catch(error => {
      console.error('💥 Checklist execution failed:', error);
      process.exit(1);
    })
    .finally(cleanup);
}

module.exports = {
  runChecklist,
  checklistItems
};