#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting Supabase Migration...');

try {
  // Load environment variables
  require('dotenv').config({ path: '.env.local' });
  require('dotenv').config({ path: '.env' });
  
  console.log('✅ Environment variables loaded');
  console.log('📡 Database URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
  console.log('🔑 Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');
  
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not set');
  }
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY not set');
  }
  
  console.log('\n🔄 Pushing schema to Supabase...');
  
  // Run prisma db push with explicit options
  const result = execSync('npx prisma db push --accept-data-loss --force-reset', {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
    }
  });
  
  console.log('\n✅ Schema migration completed successfully!');
  console.log('\n🌱 Running seed to verify tables...');
  
  // Try to run seed
  try {
    execSync('npx prisma db seed', {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: process.env
    });
    console.log('\n🎉 Migration and seed completed successfully!');
  } catch (seedError) {
    console.log('\n⚠️  Schema created but seed failed. This is normal for first migration.');
    console.log('You can run `npx prisma db seed` manually later.');
  }
  
} catch (error) {
  console.error('\n❌ Migration failed:', error.message);
  console.error('\nTroubleshooting:');
  console.error('1. Check your Supabase credentials');
  console.error('2. Verify network connection');
  console.error('3. Check Supabase dashboard for any issues');
  process.exit(1);
} 