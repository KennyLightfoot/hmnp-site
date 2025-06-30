import { execSync } from 'child_process';
import fs from 'fs';

async function syncSchemaToProduction() {
  console.log('🔄 STARTING PRODUCTION SCHEMA SYNCHRONIZATION');
  console.log('=' .repeat(60));

  try {
    // Step 1: Backup current schema
    console.log('\n💾 Creating schema backup...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `schema-backup-${timestamp}.prisma`;
    
    if (fs.existsSync('prisma/schema.prisma')) {
      fs.copyFileSync('prisma/schema.prisma', `prisma/${backupName}`);
      console.log(`✅ Schema backed up to: prisma/${backupName}`);
    }

    // Step 2: Pull current production schema
    console.log('\n📡 Pulling production database schema...');
    try {
      execSync('npx prisma db pull --force', { 
        stdio: 'inherit',
        encoding: 'utf8' 
      });
      console.log('✅ Production schema pulled successfully');
    } catch (pullError) {
      console.log('❌ Schema pull failed:', pullError.message);
      throw new Error('Cannot pull production schema - check DATABASE_URL and permissions');
    }

    // Step 3: Generate fresh Prisma client
    console.log('\n🔄 Generating Prisma client...');
    try {
      execSync('npx prisma generate', { 
        stdio: 'inherit',
        encoding: 'utf8' 
      });
      console.log('✅ Prisma client generated successfully');
    } catch (generateError) {
      console.log('❌ Client generation failed:', generateError.message);
      throw new Error('Prisma client generation failed');
    }

    // Step 4: Check for pending migrations
    console.log('\n📋 Checking migration status...');
    try {
      const migrationStatus = execSync('npx prisma migrate status', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      console.log('Migration Status:');
      console.log(migrationStatus);
      
      if (migrationStatus.includes('pending')) {
        console.log('\n🚨 Pending migrations detected!');
        console.log('⚠️ WARNING: Applying migrations to production');
        
        // Apply pending migrations
        execSync('npx prisma migrate deploy', { 
          stdio: 'inherit',
          encoding: 'utf8' 
        });
        console.log('✅ Pending migrations applied');
      } else if (migrationStatus.includes('up to date')) {
        console.log('✅ All migrations up to date');
      }
    } catch (migrationError) {
      console.log('⚠️ Migration check failed:', migrationError.message);
      console.log('Manual migration review may be needed');
    }

    // Step 5: Verify schema integrity
    console.log('\n🔍 Verifying schema integrity...');
    await verifySchemaIntegrity();

    // Step 6: Update local environment
    console.log('\n🔄 Updating local development environment...');
    if (process.env.NODE_ENV !== 'production') {
      try {
        execSync('npx prisma db push --accept-data-loss', { 
          stdio: 'inherit',
          encoding: 'utf8' 
        });
        console.log('✅ Local database synchronized');
      } catch (pushError) {
        console.log('⚠️ Local sync failed - you may need to run: npx prisma db push manually');
      }
    }

    console.log('\n🎉 SCHEMA SYNCHRONIZATION COMPLETED SUCCESSFULLY!');
    console.log('\nNext steps:');
    console.log('1. Test your application endpoints');
    console.log('2. Verify service data with: npx ts-node scripts/fix-services-data.ts');
    console.log('3. Run: npm run build to ensure everything compiles');

  } catch (error) {
    console.error('\n💥 SCHEMA SYNCHRONIZATION FAILED:', error.message);
    console.log('\nRecovery steps:');
    console.log('1. Check DATABASE_URL environment variable');
    console.log('2. Verify database permissions');
    console.log('3. Restore backup if needed');
    throw error;
  }
}

async function verifySchemaIntegrity() {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    // Test basic queries
    console.log('🧪 Testing database queries...');
    
    const tests = [
      { name: 'User table', query: () => prisma.user.findFirst() },
      { name: 'Service table', query: () => prisma.service.findFirst() },
      { name: 'Booking table', query: () => prisma.booking.findFirst() },
    ];

    for (const test of tests) {
      try {
        await test.query();
        console.log(`✅ ${test.name}: OK`);
      } catch (error) {
        console.log(`❌ ${test.name}: ${error.message}`);
      }
    }

  } catch (error) {
    console.log('❌ Schema integrity check failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run synchronization
syncSchemaToProduction();