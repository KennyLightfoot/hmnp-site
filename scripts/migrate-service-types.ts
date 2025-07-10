import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function migrateServiceTypes() {
  console.log('🔄 Starting service type migration...');
  
  try {
    // First, let's see what services currently exist
    const existingServices = await prisma.service.findMany();
    console.log('📋 Current services:', existingServices.map(s => ({ id: s.id, name: s.name, serviceType: s.serviceType })));
    
    // Delete ALL existing services to start fresh
    console.log('🗑️ Deleting all existing services...');
    await prisma.service.deleteMany({});
    console.log('✅ All services deleted');
    
    console.log('✅ Service cleanup completed successfully!');
    console.log('💡 Next: Update Prisma schema and run db push to create new enum values');
    console.log('💡 Then: Run the seed script to create the 7 unified services');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateServiceTypes()
  .catch((e) => {
    console.error('❌ Migration script failed:', e);
    process.exit(1);
  }); 