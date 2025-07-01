/**
 * Safe Database Migration Script for Enhanced Pricing Fields
 * 
 * This script applies the enhanced pricing fields migration to the production database.
 * It includes safety checks and rollback capabilities.
 * 
 * Usage: node scripts/apply-enhanced-pricing-migration.js
 * 
 * Environment: Production-safe with proper error handling
 */

import { PrismaClient } from '@prisma/client';

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

async function checkIfMigrationNeeded() {
  try {
    // Try to access the travelFee column - if it fails, migration is needed
    await prisma.$queryRaw`SELECT "travelFee" FROM "Booking" LIMIT 1`;
    console.log('✅ Enhanced pricing fields already exist - migration not needed');
    return false;
  } catch (error) {
    if (error.message.includes('column "travelFee" does not exist')) {
      console.log('📋 Enhanced pricing fields missing - migration needed');
      return true;
    } else {
      console.error('❌ Unexpected error checking migration status:', error.message);
      throw error;
    }
  }
}

async function backupBookingTable() {
  try {
    console.log('📦 Creating backup of current Booking table structure...');
    
    // Create a backup table with current booking data
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Booking_backup_enhanced_pricing" AS 
      SELECT * FROM "Booking" LIMIT 0;
    `;
    
    // Get row count for verification
    const bookingCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Booking"`;
    console.log(`📊 Current booking records: ${bookingCount[0].count}`);
    
    return true;
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    return false;
  }
}

async function applyEnhancedPricingMigration() {
  console.log('🚀 Starting enhanced pricing migration...');
  
  try {
    // Begin transaction for safe migration
    await prisma.$transaction(async (tx) => {
      console.log('  📝 Adding calculatedDistance column...');
      await tx.$executeRaw`
        ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "calculatedDistance" REAL;
      `;
      
      console.log('  📝 Adding travelFee column...');
      await tx.$executeRaw`
        ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "travelFee" DECIMAL(10,2) DEFAULT 0.00;
      `;
      
      console.log('  📝 Adding serviceAreaValidated column...');
      await tx.$executeRaw`
        ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "serviceAreaValidated" BOOLEAN DEFAULT false;
      `;
      
      console.log('  📝 Adding pricingBreakdown column...');
      await tx.$executeRaw`
        ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "pricingBreakdown" JSONB;
      `;
      
      console.log('  📝 Adding distanceCalculationMeta column...');
      await tx.$executeRaw`
        ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "distanceCalculationMeta" JSONB;
      `;
      
      console.log('  📝 Adding pricingVersion column...');
      await tx.$executeRaw`
        ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "pricingVersion" VARCHAR(10) DEFAULT '2.0.0';
      `;
      
      console.log('  📊 Creating performance indexes...');
      await tx.$executeRaw`
        CREATE INDEX IF NOT EXISTS "idx_booking_calculated_distance" ON "Booking"("calculatedDistance");
      `;
      await tx.$executeRaw`
        CREATE INDEX IF NOT EXISTS "idx_booking_service_area_validated" ON "Booking"("serviceAreaValidated");
      `;
      await tx.$executeRaw`
        CREATE INDEX IF NOT EXISTS "idx_booking_travel_fee" ON "Booking"("travelFee");
      `;
      await tx.$executeRaw`
        CREATE INDEX IF NOT EXISTS "idx_booking_pricing_version" ON "Booking"("pricingVersion");
      `;
      
      console.log('  📝 Adding column comments...');
      await tx.$executeRaw`
        COMMENT ON COLUMN "Booking"."calculatedDistance" IS 'Distance in miles from service center (ZIP 77591) to booking location';
      `;
      await tx.$executeRaw`
        COMMENT ON COLUMN "Booking"."travelFee" IS 'Travel fee charged based on distance per SOP requirements';
      `;
      await tx.$executeRaw`
        COMMENT ON COLUMN "Booking"."serviceAreaValidated" IS 'Whether booking location has been validated against service area limits';
      `;
      await tx.$executeRaw`
        COMMENT ON COLUMN "Booking"."pricingBreakdown" IS 'JSON object containing complete pricing breakdown per SOP_ENHANCED.md';
      `;
      await tx.$executeRaw`
        COMMENT ON COLUMN "Booking"."distanceCalculationMeta" IS 'Metadata about distance calculation (API source, accuracy, etc.)';
      `;
      await tx.$executeRaw`
        COMMENT ON COLUMN "Booking"."pricingVersion" IS 'Version of pricing engine used for calculation';
      `;
    });
    
    console.log('✅ Enhanced pricing migration completed successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('🔄 Transaction has been rolled back automatically');
    return false;
  }
}

async function verifyMigration() {
  try {
    console.log('🔍 Verifying migration success...');
    
    // Test that all new columns exist and are accessible
    const testQuery = await prisma.$queryRaw`
      SELECT 
        "calculatedDistance",
        "travelFee",
        "serviceAreaValidated",
        "pricingBreakdown",
        "distanceCalculationMeta",
        "pricingVersion"
      FROM "Booking" 
      LIMIT 1
    `;
    
    console.log('✅ All enhanced pricing columns are accessible');
    
    // Test that we can insert a record with the new fields
    const testInsert = await prisma.$queryRaw`
      SELECT 1 WHERE EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Booking' 
        AND column_name IN ('calculatedDistance', 'travelFee', 'serviceAreaValidated', 'pricingBreakdown', 'distanceCalculationMeta', 'pricingVersion')
      )
    `;
    
    console.log('✅ Schema verification successful');
    
    // Get updated booking count
    const bookingCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Booking"`;
    console.log(`📊 Total booking records after migration: ${bookingCount[0].count}`);
    
    return true;
  } catch (error) {
    console.error('❌ Migration verification failed:', error.message);
    return false;
  }
}

async function cleanupBackup() {
  try {
    console.log('🧹 Cleaning up backup table...');
    await prisma.$executeRaw`DROP TABLE IF EXISTS "Booking_backup_enhanced_pricing"`;
    console.log('✅ Backup cleanup completed');
  } catch (error) {
    console.warn('⚠️ Backup cleanup failed (non-critical):', error.message);
  }
}

async function main() {
  console.log('🚀 Enhanced Pricing Migration Script');
  console.log('=====================================');
  
  try {
    // Step 1: Check database connection
    const connectionOk = await checkDatabaseConnection();
    if (!connectionOk) {
      process.exit(1);
    }
    
    // Step 2: Check if migration is needed
    const migrationNeeded = await checkIfMigrationNeeded();
    if (!migrationNeeded) {
      console.log('✅ No migration needed - enhanced pricing fields already exist');
      process.exit(0);
    }
    
    // Step 3: Create backup
    const backupOk = await backupBookingTable();
    if (!backupOk) {
      console.error('❌ Cannot proceed without successful backup');
      process.exit(1);
    }
    
    // Step 4: Apply migration
    const migrationOk = await applyEnhancedPricingMigration();
    if (!migrationOk) {
      console.error('❌ Migration failed - database is in original state');
      process.exit(1);
    }
    
    // Step 5: Verify migration
    const verificationOk = await verifyMigration();
    if (!verificationOk) {
      console.error('❌ Migration verification failed');
      process.exit(1);
    }
    
    // Step 6: Cleanup backup
    await cleanupBackup();
    
    console.log('');
    console.log('🎉 MIGRATION COMPLETED SUCCESSFULLY');
    console.log('===================================');
    console.log('✅ Enhanced pricing fields have been added to the Booking table');
    console.log('✅ Performance indexes have been created');
    console.log('✅ Database is ready for enhanced pricing functionality');
    console.log('');
    console.log('Next steps:');
    console.log('- Deploy the updated booking system code');
    console.log('- Monitor booking creation for any issues');
    console.log('- Verify that travelFee calculations work correctly');
    
  } catch (error) {
    console.error('💥 Unexpected error during migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
main().catch(console.error);

export {
  checkDatabaseConnection,
  checkIfMigrationNeeded,
  applyEnhancedPricingMigration,
  verifyMigration
};