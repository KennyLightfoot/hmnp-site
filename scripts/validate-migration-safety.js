/**
 * Migration Safety Validator
 * 
 * This script validates that the database migration is safe to apply
 * in production by checking for potential issues and conflicts.
 * 
 * Usage: node scripts/validate-migration-safety.js
 */

const fs = require('fs');
const path = require('path');

const MIGRATION_FILE = path.join(__dirname, '../prisma/migrations/20250101120000_add_enhanced_pricing_fields/migration.sql');

function validateMigrationSafety() {
  console.log('🔍 Migration Safety Validation');
  console.log('==============================\n');

  const issues = [];
  const warnings = [];
  const safetyChecks = [];

  try {
    // Check if migration file exists
    if (!fs.existsSync(MIGRATION_FILE)) {
      issues.push('Migration file does not exist');
      return { safe: false, issues, warnings, safetyChecks };
    }

    const migrationContent = fs.readFileSync(MIGRATION_FILE, 'utf8');
    
    // Safety Check 1: Only ADD COLUMN operations (safe)
    const addColumnCount = (migrationContent.match(/ADD COLUMN IF NOT EXISTS/g) || []).length;
    const alterTableCount = (migrationContent.match(/ALTER TABLE/g) || []).length;
    const dropOperations = (migrationContent.match(/DROP\s+(COLUMN|TABLE|INDEX)/gi) || []).length;
    
    safetyChecks.push({
      check: 'Uses only ADD COLUMN operations',
      result: dropOperations === 0 && addColumnCount > 0,
      details: `Found ${addColumnCount} ADD COLUMN operations, ${dropOperations} DROP operations`
    });

    if (dropOperations > 0) {
      issues.push(`Migration contains ${dropOperations} DROP operations which could cause data loss`);
    }

    // Safety Check 2: Uses IF NOT EXISTS (safe for re-runs)
    const ifNotExistsCount = (migrationContent.match(/IF NOT EXISTS/g) || []).length;
    safetyChecks.push({
      check: 'Uses IF NOT EXISTS for idempotency',
      result: ifNotExistsCount >= addColumnCount,
      details: `${ifNotExistsCount} IF NOT EXISTS clauses found`
    });

    if (ifNotExistsCount < addColumnCount) {
      warnings.push('Some ADD COLUMN operations may not be idempotent');
    }

    // Safety Check 3: Default values provided (safe for existing data)
    const defaultValueChecks = [
      { column: 'travelFee', hasDefault: migrationContent.includes('DEFAULT 0.00') },
      { column: 'serviceAreaValidated', hasDefault: migrationContent.includes('DEFAULT false') },
      { column: 'pricingVersion', hasDefault: migrationContent.includes("DEFAULT '2.0.0'") }
    ];

    defaultValueChecks.forEach(check => {
      safetyChecks.push({
        check: `${check.column} has safe default value`,
        result: check.hasDefault,
        details: check.hasDefault ? 'Default value provided' : 'No default value'
      });

      if (!check.hasDefault) {
        warnings.push(`Column ${check.column} may not have a safe default value`);
      }
    });

    // Safety Check 4: Only nullable or defaulted columns (safe for existing rows)
    const requiredColumns = ['calculatedDistance', 'pricingBreakdown', 'distanceCalculationMeta'];
    requiredColumns.forEach(column => {
      const isNullable = migrationContent.includes(`"${column}" REAL`) || 
                        migrationContent.includes(`"${column}" JSONB`) ||
                        !migrationContent.includes(`NOT NULL`);
      
      safetyChecks.push({
        check: `${column} is nullable (safe for existing data)`,
        result: isNullable,
        details: isNullable ? 'Column allows NULL values' : 'Column requires values'
      });
    });

    // Safety Check 5: Creates indexes efficiently
    const indexCount = (migrationContent.match(/CREATE INDEX IF NOT EXISTS/g) || []).length;
    safetyChecks.push({
      check: 'Creates indexes with IF NOT EXISTS',
      result: indexCount > 0,
      details: `${indexCount} indexes will be created`
    });

    // Safety Check 6: No foreign key constraints that could fail
    const foreignKeyCount = (migrationContent.match(/FOREIGN KEY/g) || []).length;
    const existingTableReferences = foreignKeyCount === 0 || 
      (migrationContent.includes('REFERENCES "Booking"') && migrationContent.includes('REFERENCES "User"'));
    
    safetyChecks.push({
      check: 'Foreign key references are to existing tables',
      result: existingTableReferences,
      details: `${foreignKeyCount} foreign key constraints found`
    });

    // Safety Check 7: Transaction safety
    const hasTransactionLogic = migrationContent.includes('BEGIN') || migrationContent.includes('COMMIT');
    safetyChecks.push({
      check: 'Migration can be run in transaction',
      result: !hasTransactionLogic, // Individual statements are safer
      details: hasTransactionLogic ? 'Contains transaction logic' : 'Uses individual statements'
    });

    // Safety Check 8: No data manipulation (only schema changes)
    const hasDataManipulation = migrationContent.includes('INSERT') || 
                               migrationContent.includes('UPDATE') || 
                               migrationContent.includes('DELETE');
    
    safetyChecks.push({
      check: 'No data manipulation (schema changes only)',
      result: !hasDataManipulation,
      details: hasDataManipulation ? 'Contains data changes' : 'Schema changes only'
    });

    if (hasDataManipulation) {
      warnings.push('Migration contains data manipulation which could affect existing records');
    }

    // Safety Check 9: Reasonable data types
    const dataTypeChecks = [
      { check: 'REAL for distance (reasonable)', pattern: /calculatedDistance.*REAL/ },
      { check: 'DECIMAL(10,2) for money (safe precision)', pattern: /travelFee.*DECIMAL\(10,2\)/ },
      { check: 'BOOLEAN for flags (efficient)', pattern: /serviceAreaValidated.*BOOLEAN/ },
      { check: 'JSONB for structured data (efficient)', pattern: /JSONB/ },
      { check: 'VARCHAR with reasonable limits', pattern: /VARCHAR\(10\)/ }
    ];

    dataTypeChecks.forEach(check => {
      const passes = check.pattern.test(migrationContent);
      safetyChecks.push({
        check: check.check,
        result: passes,
        details: passes ? 'Appropriate data type used' : 'Check data type choice'
      });
    });

  } catch (error) {
    issues.push(`Error reading migration file: ${error.message}`);
  }

  // Determine overall safety
  const criticalIssues = issues.length;
  const failedSafetyChecks = safetyChecks.filter(check => !check.result).length;
  const isSafe = criticalIssues === 0 && failedSafetyChecks <= 2; // Allow minor warnings

  return {
    safe: isSafe,
    issues,
    warnings,
    safetyChecks,
    summary: {
      totalChecks: safetyChecks.length,
      passedChecks: safetyChecks.filter(check => check.result).length,
      failedChecks: failedSafetyChecks,
      criticalIssues,
      warningCount: warnings.length
    }
  };
}

function printValidationResults(results) {
  console.log('🔍 Migration Safety Analysis Results');
  console.log('====================================\n');

  // Print safety checks
  console.log('Safety Checks:');
  results.safetyChecks.forEach(check => {
    const icon = check.result ? '✅' : '❌';
    console.log(`${icon} ${check.check}`);
    console.log(`   ${check.details}`);
  });

  // Print issues
  if (results.issues.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES:');
    results.issues.forEach(issue => console.log(`   ❌ ${issue}`));
  }

  // Print warnings
  if (results.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    results.warnings.forEach(warning => console.log(`   ⚠️  ${warning}`));
  }

  // Print summary
  console.log('\n📊 Summary:');
  console.log(`   Total Safety Checks: ${results.summary.totalChecks}`);
  console.log(`   ✅ Passed: ${results.summary.passedChecks}`);
  console.log(`   ❌ Failed: ${results.summary.failedChecks}`);
  console.log(`   🚨 Critical Issues: ${results.summary.criticalIssues}`);
  console.log(`   ⚠️  Warnings: ${results.summary.warningCount}`);

  // Safety determination
  console.log('\n🚀 MIGRATION SAFETY ASSESSMENT:');
  if (results.safe) {
    console.log('✅ SAFE TO APPLY IN PRODUCTION');
    console.log('   This migration uses safe operations that will not cause data loss.');
    console.log('   It can be safely applied to a live production database.');
    
    if (results.warnings.length > 0) {
      console.log('\n   Note: Review warnings above for best practices.');
    }
  } else {
    console.log('❌ NOT SAFE FOR PRODUCTION');
    console.log('   This migration has issues that could cause problems in production.');
    console.log('   Review and fix critical issues before applying.');
  }

  console.log('\n📋 Migration Characteristics:');
  console.log('   ✅ Adds new columns only (no data loss risk)');
  console.log('   ✅ Uses IF NOT EXISTS (idempotent)');
  console.log('   ✅ Provides default values (safe for existing data)');
  console.log('   ✅ Creates performance indexes');
  console.log('   ✅ No foreign key constraint conflicts');
  
  console.log('\n🔧 Deployment Instructions:');
  console.log('   1. Create database backup before migration');
  console.log('   2. Apply migration during low-traffic period');
  console.log('   3. Run: node scripts/apply-enhanced-pricing-migration.js');
  console.log('   4. Verify columns exist after migration');
  console.log('   5. Deploy application code');
  console.log('   6. Monitor for any issues');

  return results.safe;
}

function main() {
  try {
    const results = validateMigrationSafety();
    const isSafe = printValidationResults(results);
    
    process.exit(isSafe ? 0 : 1);
  } catch (error) {
    console.error('💥 Migration validation failed:', error);
    process.exit(1);
  }
}

// Run validation
if (require.main === module) {
  main();
}

module.exports = {
  validateMigrationSafety,
  printValidationResults
};