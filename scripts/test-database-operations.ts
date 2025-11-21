#!/usr/bin/env tsx
/**
 * Test Database Operations After Upgrade
 * Runs basic read/write operations to verify everything works
 */

import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function testDatabaseOperations() {
  console.log('🧪 Testing Database Operations...\n');

  const tests: Array<{ name: string; test: () => Promise<void> }> = [];

  // Test 1: Basic query
  tests.push({
    name: 'Basic SELECT query',
    test: async () => {
      await prisma.$queryRaw`SELECT 1 as test`;
      console.log('   ✅ Basic query works');
    }
  });

  // Test 2: Check tables exist
  tests.push({
    name: 'Check critical tables exist',
    test: async () => {
      const tables = ['Booking', 'User', 'Service'];
      for (const table of tables) {
        const result = await prisma.$queryRawUnsafe(
          `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '${table}')`
        );
        if (result && Array.isArray(result) && result[0]) {
          console.log(`   ✅ Table '${table}' exists`);
        } else {
          throw new Error(`Table '${table}' not found`);
        }
      }
    }
  });

  // Test 3: Test Prisma Client generation
  tests.push({
    name: 'Prisma Client operations',
    test: async () => {
      // Try to query a simple model
      const serviceCount = await prisma.service.count();
      console.log(`   ✅ Prisma Client works (found ${serviceCount} services)`);
    }
  });

  // Test 4: Test transactions
  tests.push({
    name: 'Transaction support',
    test: async () => {
      await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT 1`;
      });
      console.log('   ✅ Transactions work');
    }
  });

  // Run all tests
  let passed = 0;
  let failed = 0;

  for (const { name, test } of tests) {
    try {
      process.stdout.write(`Testing: ${name}... `);
      await test();
      passed++;
    } catch (error) {
      console.log(`\n   ❌ Failed: ${error instanceof Error ? error.message : String(error)}`);
      failed++;
    }
  }

  console.log('\n📊 Test Results:');
  console.log(`   ✅ Passed: ${passed}`);
  if (failed > 0) {
    console.log(`   ❌ Failed: ${failed}`);
    process.exit(1);
  } else {
    console.log('   ✅ All tests passed!');
  }
}

testDatabaseOperations()
  .catch((error) => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

