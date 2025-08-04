#!/usr/bin/env tsx

/**
 * Test script to verify UptimeRobot and Papertrail setup
 * Run with: pnpm tsx scripts/test-monitoring-setup.ts
 */

import { logger } from '../lib/logger';
import { getErrorMessage } from '@/lib/utils/error-utils';
import axios from 'axios';

async function testHealthEndpoint() {
  console.log('🔍 Testing Health Endpoint...');
  
  try {
    const response = await axios.get('http://localhost:3000/api/health', {
      timeout: 5000
    });
    
    console.log('✅ Health endpoint is working');
    console.log('📊 Response:', {
      status: response.status,
      data: response.data
    });
    
    return true;
  } catch (error) {
    console.log('❌ Health endpoint failed');
    console.log('Error:', error instanceof Error ? getErrorMessage(error) : String(error));
    return false;
  }
}

async function testLogger() {
  console.log('🔍 Testing Logger Configuration...');
  
  try {
    // Test different log levels
    logger.info('Test info message', 'monitoring-test', { 
      testType: 'logger-verification',
      timestamp: new Date().toISOString()
    });
    
    logger.warn('Test warning message', 'monitoring-test', { 
      testType: 'logger-verification',
      warningLevel: 'medium'
    });
    
    logger.error('Test error message', 'monitoring-test', new Error('Test error'), { 
      testType: 'logger-verification',
      errorLevel: 'high'
    });
    
    console.log('✅ Logger is working');
    console.log('📝 Check your logs to verify Papertrail integration');
    
    return true;
  } catch (error) {
    console.log('❌ Logger failed');
    console.log('Error:', error instanceof Error ? getErrorMessage(error) : String(error));
    return false;
  }
}

function checkEnvironmentVariables() {
  console.log('🔍 Checking Environment Variables...');
  
  const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ];
  
  const optionalVars = [
    'PAPERTRAIL_HOST',
    'PAPERTRAIL_PORT',
    'PAPERTRAIL_HOSTNAME',
    'UPTIMEROBOT_WEBHOOK_URL'
  ];
  
  let allRequired = true;
  let papertrailConfigured = true;
  
  console.log('Required variables:');
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`  ✅ ${varName}: configured`);
    } else {
      console.log(`  ❌ ${varName}: missing`);
      allRequired = false;
    }
  });
  
  console.log('\nPapertrail configuration:');
  ['PAPERTRAIL_HOST', 'PAPERTRAIL_PORT'].forEach(varName => {
    const value = process.env[varName];
    if (value && value !== 'XXXXX') {
      console.log(`  ✅ ${varName}: configured`);
    } else {
      console.log(`  ⚠️  ${varName}: not configured (logs will only go to console)`);
      papertrailConfigured = false;
    }
  });
  
  console.log('\nOptional variables:');
  optionalVars.slice(2).forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`  ✅ ${varName}: configured`);
    } else {
      console.log(`  ⚠️  ${varName}: not configured`);
    }
  });
  
  return { allRequired, papertrailConfigured };
}

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...');
  
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();
    
    console.log('✅ Database connection is working');
    return true;
  } catch (error) {
    console.log('❌ Database connection failed');
    console.log('Error:', error instanceof Error ? getErrorMessage(error) : String(error));
    return false;
  }
}

function printSetupInstructions() {
  console.log('\n📋 Next Steps for Complete Setup:');
  console.log('');
  console.log('1. 🤖 UptimeRobot Setup:');
  console.log('   - Go to https://uptimerobot.com and create a free account');
  console.log('   - Add HTTP monitor for: https://your-domain.com/api/health');
  console.log('   - Set monitoring interval to 5 minutes (free tier)');
  console.log('   - Configure email alerts');
  console.log('');
  console.log('2. 📄 Papertrail Setup:');
  console.log('   - Go to https://papertrail.com and create a free account');
  console.log('   - Get your log destination (logs.papertrailapp.com:XXXXX)');
  console.log('   - Update your .env file with PAPERTRAIL_HOST and PAPERTRAIL_PORT');
  console.log('   - Restart your application to enable log forwarding');
  console.log('');
  console.log('3. 🔧 Production Deployment:');
  console.log('   - Add environment variables to your hosting platform');
  console.log('   - Test the /api/health endpoint after deployment');
  console.log('   - Verify logs are appearing in Papertrail dashboard');
  console.log('');
  console.log('4. 📊 Monitoring Dashboard:');
  console.log('   - Set up Papertrail alerts for error patterns');
  console.log('   - Configure UptimeRobot status page (optional)');
  console.log('   - Test alert notifications');
}

async function main() {
  console.log('🚀 HMNP Monitoring Setup Test');
  console.log('================================\n');
  
  // Check environment variables
  const { allRequired, papertrailConfigured } = checkEnvironmentVariables();
  console.log('');
  
  // Test database connection
  const dbWorking = await testDatabaseConnection();
  console.log('');
  
  // Test logger
  const loggerWorking = testLogger();
  console.log('');
  
  // Test health endpoint (only if we can assume the app is running)
  console.log('ℹ️  To test the health endpoint, run your app with:');
  console.log('   pnpm dev');
  console.log('   Then visit: http://localhost:3000/api/health');
  console.log('');
  
  // Summary
  console.log('📊 Setup Summary:');
  console.log(`  Database: ${dbWorking ? '✅' : '❌'}`);
  console.log(`  Logger: ${await loggerWorking ? '✅' : '❌'}`);
  console.log(`  Required Env Vars: ${allRequired ? '✅' : '❌'}`);
  console.log(`  Papertrail Config: ${papertrailConfigured ? '✅' : '⚠️'}`);
  
  printSetupInstructions();
  
  if (dbWorking && await loggerWorking && allRequired) {
    console.log('\n🎉 Your monitoring setup is ready for UptimeRobot and Papertrail!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Please fix the issues above before proceeding.');
    process.exit(1);
  }
}

main().catch(console.error); 
