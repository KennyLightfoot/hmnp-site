#!/usr/bin/env tsx

/**
 * Booking System Test Script
 * Houston Mobile Notary Pros
 * 
 * Tests the booking system functionality and recent fixes
 */

import { redis } from '@/lib/redis';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

class BookingSystemTester {
  private results: TestResult[] = [];

  async runAllTests(): Promise<void> {
    console.log('🧪 Testing Booking System...\n');

    await this.testRedisConnection();
    await this.testPricingAPI();
    await this.testEnvironmentVariables();
    await this.testDatabaseConnection();

    this.printResults();
  }

  private async testRedisConnection(): Promise<void> {
    console.log('🔍 Testing Redis Connection...');
    
    try {
      // Test Redis ping
      const pingResult = await redis.ping();
      
      if (pingResult === 'PONG') {
        this.addResult('Redis Connection', true, { ping: pingResult });
        console.log('✅ Redis connection successful');
      } else {
        this.addResult('Redis Connection', false, 'Unexpected ping response');
        console.log('❌ Redis ping failed');
      }
    } catch (error) {
      this.addResult('Redis Connection', false, error instanceof Error ? error.message : 'Unknown error');
      console.log('❌ Redis connection failed:', error);
    }
  }

  private async testPricingAPI(): Promise<void> {
    console.log('🔍 Testing Pricing API...');
    
    try {
      const response = await fetch('http://localhost:3000/api/pricing/transparent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: 'STANDARD_NOTARY',
          documentCount: 1,
          signerCount: 1
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.addResult('Pricing API', true, { status: response.status, hasData: !!data });
        console.log('✅ Pricing API working');
      } else {
        this.addResult('Pricing API', false, `HTTP ${response.status}`);
        console.log('❌ Pricing API failed:', response.status);
      }
    } catch (error) {
      this.addResult('Pricing API', false, error instanceof Error ? error.message : 'Network error');
      console.log('❌ Pricing API error:', error);
      console.log('💡 Make sure development server is running: pnpm dev');
    }
  }

  private async testEnvironmentVariables(): Promise<void> {
    console.log('🔍 Testing Environment Variables...');
    
    // Load environment variables from .env.local
    try {
      const dotenv = await import('dotenv');
      dotenv.config({ path: '.env.local' });
    } catch (error) {
      console.log('⚠️ Could not load .env.local, using existing environment');
    }
    
    const requiredVars = [
      'DATABASE_URL',
      'REDIS_URL',
      'NEXTAUTH_SECRET',
      'STRIPE_SECRET_KEY'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length === 0) {
      this.addResult('Environment Variables', true, { checked: requiredVars.length });
      console.log('✅ All required environment variables present');
    } else {
      this.addResult('Environment Variables', false, `Missing: ${missingVars.join(', ')}`);
      console.log('❌ Missing environment variables:', missingVars);
      console.log('💡 Make sure .env.local is loaded or variables are set in environment');
    }
  }

  private async testDatabaseConnection(): Promise<void> {
    console.log('🔍 Testing Database Connection...');
    
    try {
      // Test database connection by checking if we can import Prisma
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      // Try a simple query
      await prisma.$connect();
      await prisma.$disconnect();
      
      this.addResult('Database Connection', true);
      console.log('✅ Database connection successful');
    } catch (error) {
      this.addResult('Database Connection', false, error instanceof Error ? error.message : 'Unknown error');
      console.log('❌ Database connection failed:', error);
    }
  }

  private addResult(name: string, passed: boolean, error?: string, details?: any): void {
    this.results.push({
      name,
      passed,
      error,
      details
    });
  }

  private printResults(): void {
    console.log('\n📊 Test Results:');
    console.log('================');
    
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    
    this.results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.name}`);
      
      if (!result.passed && result.error) {
        console.log(`   Error: ${result.error}`);
      }
      
      if (result.details) {
        console.log(`   Details: ${JSON.stringify(result.details)}`);
      }
    });
    
    console.log(`\n🎯 Summary: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('🎉 All tests passed! Booking system is ready.');
    } else {
      console.log('⚠️  Some tests failed. Please check the issues above.');
    }
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new BookingSystemTester();
  tester.runAllTests().catch(console.error);
}

export default BookingSystemTester; 