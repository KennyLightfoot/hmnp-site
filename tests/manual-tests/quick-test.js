#!/usr/bin/env node

/**
 * Quick API Test Script
 * Simple diagnostic test for the booking system
 */

const baseUrl = 'http://localhost:3000';

async function quickTest() {
  console.log('🔍 Quick API Diagnostic Test');
  console.log('=====================================');
  
  // Test 1: Health Check
  console.log('\n1. Testing Health Check...');
  try {
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    const healthText = await healthResponse.text();
    console.log(`Status: ${healthResponse.status}`);
    console.log(`Content-Type: ${healthResponse.headers.get('content-type')}`);
    console.log(`Response: ${healthText.substring(0, 200)}...`);
  } catch (error) {
    console.log(`Health check error: ${error.message}`);
  }
  
  // Test 2: Services
  console.log('\n2. Testing Services...');
  try {
    const servicesResponse = await fetch(`${baseUrl}/api/services`);
    const servicesText = await servicesResponse.text();
    console.log(`Status: ${servicesResponse.status}`);
    console.log(`Content-Type: ${servicesResponse.headers.get('content-type')}`);
    console.log(`Response: ${servicesText.substring(0, 200)}...`);
  } catch (error) {
    console.log(`Services error: ${error.message}`);
  }
  
  // Test 3: Database Connection
  console.log('\n3. Testing Database Connection...');
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful');
    console.log(`Query result: ${JSON.stringify(result)}`);
    await prisma.$disconnect();
  } catch (error) {
    console.log(`❌ Database error: ${error.message}`);
  }
  
  // Test 4: Services in Database
  console.log('\n4. Testing Services in Database...');
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const services = await prisma.service.findMany({
      where: { active: true },
      select: { id: true, name: true, price: true }
    });
    console.log(`✅ Found ${services.length} services in database`);
    services.forEach(service => {
      console.log(`  - ${service.name}: $${service.price}`);
    });
    await prisma.$disconnect();
  } catch (error) {
    console.log(`❌ Services query error: ${error.message}`);
  }
  
  console.log('\n=====================================');
  console.log('🏁 Quick test completed');
}

// Run the test
quickTest().catch(console.error); 