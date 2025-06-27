#!/usr/bin/env tsx

/**
 * Database Migration Test Script
 * Tests the unified database connection and verifies wrapper exports work
 */

import { performance } from 'perf_hooks';

// Test all import paths to ensure they work
console.log('🧪 Testing Database Connection Migration...\n');

// Test 1: Direct import from unified connection
console.log('📋 Test 1: Direct unified connection import');
try {
  const { prisma: directPrisma, prismaHealthCheck: directHealthCheck, withRetry: directWithRetry } = 
    await import('../lib/database-connection');
  
  console.log('✅ Direct import successful');
  
  // Test health check
  const startTime = performance.now();
  const healthResult = await directHealthCheck();
  const endTime = performance.now();
  
  console.log(`   Health check: ${healthResult.status}`);
  console.log(`   Response time: ${healthResult.responseTime || Math.round(endTime - startTime)}ms`);
  
  if (healthResult.status === 'healthy') {
    console.log('✅ Direct connection health check passed');
  } else {
    console.log('❌ Direct connection health check failed:', healthResult.error);
  }
} catch (error) {
  console.log('❌ Direct import failed:', error);
}

console.log('');

// Test 2: Import from lib/db.ts wrapper
console.log('📋 Test 2: lib/db.ts wrapper import');
try {
  const { prisma: dbPrisma, prismaHealthCheck: dbHealthCheck } = 
    await import('../lib/db');
  
  console.log('✅ lib/db.ts import successful');
  
  // Test health check through wrapper
  const healthResult = await dbHealthCheck();
  console.log(`   Health check: ${healthResult.status}`);
  console.log(`   Response time: ${healthResult.responseTime}ms`);
  
  if (healthResult.status === 'healthy') {
    console.log('✅ lib/db.ts wrapper health check passed');
  } else {
    console.log('❌ lib/db.ts wrapper health check failed:', healthResult.error);
  }
} catch (error) {
  console.log('❌ lib/db.ts import failed:', error);
}

console.log('');

// Test 3: Import from lib/prisma.ts wrapper
console.log('📋 Test 3: lib/prisma.ts wrapper import');
try {
  const { prisma: prismaPrisma, prismaHealthCheck: prismaHealthCheck } = 
    await import('../lib/prisma');
  
  console.log('✅ lib/prisma.ts import successful');
  
  // Test health check through wrapper
  const healthResult = await prismaHealthCheck();
  console.log(`   Health check: ${healthResult.status}`);
  console.log(`   Response time: ${healthResult.responseTime}ms`);
  
  if (healthResult.status === 'healthy') {
    console.log('✅ lib/prisma.ts wrapper health check passed');
  } else {
    console.log('❌ lib/prisma.ts wrapper health check failed:', healthResult.error);
  }
} catch (error) {
  console.log('❌ lib/prisma.ts import failed:', error);
}

console.log('');

// Test 4: Test new utility functions
console.log('📋 Test 4: New utility functions');
try {
  const { withRetry, transaction } = await import('../lib/database-connection');
  
  console.log('✅ Utility functions imported successfully');
  
  // Test withRetry with a simple query
  const retryResult = await withRetry(async (client) => {
    return await client.$queryRaw`SELECT 1 as test`;
  });
  
  console.log('✅ withRetry function works:', retryResult);
  
  // Test transaction wrapper
  const transactionResult = await transaction(async (client) => {
    return await client.$queryRaw`SELECT 'transaction_test' as result`;
  });
  
  console.log('✅ transaction function works:', transactionResult);
  
} catch (error) {
  console.log('❌ Utility function test failed:', error);
}

console.log('');

// Test 5: Test real database operation
console.log('📋 Test 5: Real database operations');
try {
  const { prisma } = await import('../lib/db');
  
  // Test basic query
  const result = await prisma.$queryRaw`SELECT NOW() as current_time, 'migration_test' as test_type`;
  console.log('✅ Database query successful:', result);
  
  // Test if we can access tables (try User table)
  try {
    const userCount = await prisma.user.count();
    console.log(`✅ User table accessible: ${userCount} users found`);
  } catch (tableError) {
    console.log('⚠️  User table access test failed (table may not exist):', tableError);
  }
  
  // Test if we can access services table
  try {
    const serviceCount = await prisma.Service.count();
    console.log(`✅ Service table accessible: ${serviceCount} services found`);
  } catch (tableError) {
    console.log('⚠️  Service table access test failed (table may not exist):', tableError);
  }
  
} catch (error) {
  console.log('❌ Real database operation failed:', error);
}

console.log('');

// Test 6: Performance comparison (if applicable)
console.log('📋 Test 6: Connection performance');
try {
  const { prisma } = await import('../lib/database-connection');
  
  const iterations = 5;
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await prisma.$queryRaw`SELECT 1`;
    const end = performance.now();
    times.push(end - start);
  }
  
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  console.log(`✅ Average query time over ${iterations} queries: ${avgTime.toFixed(2)}ms`);
  console.log(`   Min: ${Math.min(...times).toFixed(2)}ms, Max: ${Math.max(...times).toFixed(2)}ms`);
  
} catch (error) {
  console.log('❌ Performance test failed:', error);
}

console.log('');
console.log('🎉 Database migration testing complete!');
console.log('');

// Cleanup and exit
process.exit(0);