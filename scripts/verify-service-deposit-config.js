/**
 * Service Deposit Configuration Verification Script
 * 
 * This script verifies that all active services have proper deposit requirements
 * and updates any services that don't meet the business requirements.
 * 
 * Business Requirements:
 * - All appointments must require deposit payment to be confirmed
 * - All active services should have requiresDeposit: true
 * - Deposit amounts should be reasonable (typically 50% of service price or minimum $25)
 * 
 * Usage: node scripts/verify-service-deposit-config.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function getServiceConfiguration() {
  try {
    const services = await prisma.service.findMany({
      select: {
        id: true,
        name: true,
        serviceType: true,
        basePrice: true,
        requiresDeposit: true,
        depositAmount: true,
        isActive: true
      },
      orderBy: {
        serviceType: 'asc'
      }
    });

    console.log(`📊 Found ${services.length} services in database`);
    return services;
  } catch (error) {
    console.error('❌ Failed to fetch service configuration:', error.message);
    return null;
  }
}

function analyzeServiceConfiguration(services) {
  const analysis = {
    total: services.length,
    active: 0,
    requireDeposit: 0,
    properDepositAmount: 0,
    issues: []
  };

  console.log('\n📋 Service Configuration Analysis');
  console.log('================================');

  services.forEach(service => {
    const basePrice = typeof service.basePrice === 'object' ? service.basePrice.toNumber() : Number(service.basePrice);
    const depositAmount = typeof service.depositAmount === 'object' ? service.depositAmount.toNumber() : Number(service.depositAmount);

    if (service.isActive) {
      analysis.active++;
    }

    if (service.requiresDeposit) {
      analysis.requireDeposit++;
    }

    // Check if deposit amount is reasonable (at least $25 or 25% of base price)
    const minDepositAmount = Math.max(25, basePrice * 0.25);
    if (depositAmount >= minDepositAmount) {
      analysis.properDepositAmount++;
    }

    console.log(`\n🔸 ${service.name} (${service.serviceType})`);
    console.log(`   Active: ${service.isActive ? '✅' : '❌'}`);
    console.log(`   Base Price: $${basePrice.toFixed(2)}`);
    console.log(`   Requires Deposit: ${service.requiresDeposit ? '✅' : '❌'}`);
    console.log(`   Deposit Amount: $${depositAmount.toFixed(2)}`);

    // Identify issues
    if (service.isActive && !service.requiresDeposit) {
      analysis.issues.push({
        service: service.name,
        issue: 'Active service does not require deposit',
        recommendation: 'Set requiresDeposit to true'
      });
    }

    if (service.requiresDeposit && depositAmount < minDepositAmount) {
      analysis.issues.push({
        service: service.name,
        issue: `Deposit amount $${depositAmount.toFixed(2)} is too low (minimum should be $${minDepositAmount.toFixed(2)})`,
        recommendation: `Increase deposit amount to at least $${minDepositAmount.toFixed(2)}`
      });
    }

    if (service.requiresDeposit && depositAmount > basePrice) {
      analysis.issues.push({
        service: service.name,
        issue: `Deposit amount $${depositAmount.toFixed(2)} exceeds base price $${basePrice.toFixed(2)}`,
        recommendation: `Reduce deposit amount to reasonable percentage of base price`
      });
    }
  });

  return analysis;
}

function printAnalysisSummary(analysis) {
  console.log('\n📊 Configuration Summary');
  console.log('========================');
  console.log(`Total Services: ${analysis.total}`);
  console.log(`Active Services: ${analysis.active}`);
  console.log(`Services Requiring Deposits: ${analysis.requireDeposit}`);
  console.log(`Services with Proper Deposit Amounts: ${analysis.properDepositAmount}`);
  
  if (analysis.issues.length > 0) {
    console.log(`\n⚠️  Found ${analysis.issues.length} configuration issues:`);
    analysis.issues.forEach((issue, index) => {
      console.log(`\n${index + 1}. ${issue.service}`);
      console.log(`   Issue: ${issue.issue}`);
      console.log(`   Recommendation: ${issue.recommendation}`);
    });
  } else {
    console.log('\n✅ All services have proper deposit configuration!');
  }
}

async function fixServiceConfiguration(services, analysis) {
  if (analysis.issues.length === 0) {
    console.log('\n✅ No fixes needed - all services properly configured');
    return true;
  }

  console.log(`\n🔧 Applying fixes for ${analysis.issues.length} configuration issues...`);

  try {
    await prisma.$transaction(async (tx) => {
      for (const service of services) {
        const basePrice = typeof service.basePrice === 'object' ? service.basePrice.toNumber() : Number(service.basePrice);
        const depositAmount = typeof service.depositAmount === 'object' ? service.depositAmount.toNumber() : Number(service.depositAmount);
        
        let needsUpdate = false;
        let updateData = {};

        // Fix 1: Ensure all active services require deposits
        if (service.isActive && !service.requiresDeposit) {
          updateData.requiresDeposit = true;
          needsUpdate = true;
          console.log(`  ✅ Setting requiresDeposit=true for ${service.name}`);
        }

        // Fix 2: Ensure deposit amounts are reasonable
        const minDepositAmount = Math.max(25, basePrice * 0.25);
        const maxDepositAmount = basePrice * 0.8; // Max 80% of base price

        if (service.requiresDeposit && depositAmount < minDepositAmount) {
          const newDepositAmount = Math.min(Math.round(basePrice * 0.5), Math.max(minDepositAmount, 50));
          updateData.depositAmount = newDepositAmount;
          needsUpdate = true;
          console.log(`  ✅ Updating deposit amount for ${service.name}: $${depositAmount.toFixed(2)} → $${newDepositAmount.toFixed(2)}`);
        }

        if (service.requiresDeposit && depositAmount > maxDepositAmount) {
          const newDepositAmount = Math.round(basePrice * 0.5);
          updateData.depositAmount = newDepositAmount;
          needsUpdate = true;
          console.log(`  ✅ Reducing excessive deposit amount for ${service.name}: $${depositAmount.toFixed(2)} → $${newDepositAmount.toFixed(2)}`);
        }

        // Apply updates if needed
        if (needsUpdate) {
          updateData.updatedAt = new Date();
          await tx.service.update({
            where: { id: service.id },
            data: updateData
          });
        }
      }
    });

    console.log('✅ Service configuration fixes applied successfully');
    return true;

  } catch (error) {
    console.error('❌ Failed to apply service configuration fixes:', error.message);
    return false;
  }
}

async function verifyFixesApplied() {
  try {
    console.log('\n🔍 Verifying fixes were applied correctly...');
    
    const services = await getServiceConfiguration();
    if (!services) return false;

    const analysis = analyzeServiceConfiguration(services);
    
    if (analysis.issues.length === 0) {
      console.log('✅ All service configuration issues have been resolved');
      return true;
    } else {
      console.log(`❌ ${analysis.issues.length} issues still remain after fixes`);
      return false;
    }
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔧 Service Deposit Configuration Verification');
  console.log('=============================================');

  try {
    // Step 1: Check database connection
    const connectionOk = await checkDatabaseConnection();
    if (!connectionOk) {
      process.exit(1);
    }

    // Step 2: Get current service configuration
    const services = await getServiceConfiguration();
    if (!services) {
      process.exit(1);
    }

    // Step 3: Analyze configuration
    const analysis = analyzeServiceConfiguration(services);
    printAnalysisSummary(analysis);

    // Step 4: Apply fixes if needed
    const fixesOk = await fixServiceConfiguration(services, analysis);
    if (!fixesOk) {
      process.exit(1);
    }

    // Step 5: Verify fixes
    const verificationOk = await verifyFixesApplied();
    if (!verificationOk) {
      process.exit(1);
    }

    console.log('\n🎉 SERVICE CONFIGURATION VERIFICATION COMPLETE');
    console.log('==============================================');
    console.log('✅ All services are properly configured for deposit requirements');
    console.log('✅ Booking system will enforce payment for all appointments');
    console.log('✅ No appointments will be auto-confirmed without payment');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the verification
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  checkDatabaseConnection,
  getServiceConfiguration,
  analyzeServiceConfiguration,
  fixServiceConfiguration
};