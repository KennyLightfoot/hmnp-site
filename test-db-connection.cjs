const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...');
  
  // Test the new pooled DATABASE_URL
  const pooledUrl = process.env.DATABASE_URL;
  console.log('📍 Pooled URL:', pooledUrl ? pooledUrl.replace(/:[^:@]*@/, ':***@') : 'NOT SET');
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: pooledUrl
      }
    },
    log: ['error', 'warn']
  });

  try {
    console.log('⏱️  Testing database connectivity...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful!', result);
    
    console.log('⏱️  Testing user table access...');
    const userCount = await prisma.user.count();
    console.log('✅ User table accessible, count:', userCount);
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });
testDatabaseConnection();