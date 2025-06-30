import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function emergencyDiagnostic() {
  console.log('🚨 EMERGENCY DIAGNOSTIC STARTING...');
  
  try {
    // Test 1: Raw SQL query
    const rawTest = await prisma.$queryRaw`SELECT version()`;
    console.log('✅ Raw SQL query works:', rawTest);
    
    // Test 2: Check if Service table exists
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Service'
      );
    `;
    console.log('🔍 Service table exists:', tableExists);
    
    // Test 3: Show table structure
    const tableStructure = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Service'
      ORDER BY ordinal_position;
    `;
    console.log('📋 Service table structure:', tableStructure);
    
    // Test 4: Show all data in Service table
    const allServices = await prisma.$queryRaw`SELECT * FROM "Service" LIMIT 10`;
    console.log('📊 Service table data:', allServices);

    // Test 5: Check for migration history
    const migrations = await prisma.$queryRaw`
      SELECT migration_name, finished_at 
      FROM "_prisma_migrations" 
      ORDER BY finished_at DESC 
      LIMIT 5
    `;
    console.log('📜 Recent migrations:', migrations);
    
  } catch (error) {
    console.error('💥 Emergency diagnostic failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

emergencyDiagnostic();