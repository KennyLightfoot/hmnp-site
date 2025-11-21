#!/usr/bin/env node
/**
 * Run migration for Notary Network models
 * This script creates the migration and generates the Prisma client
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

process.chdir(rootDir);

console.log('🔧 Running Prisma migration for Notary Network models...\n');

try {
  // Run migration
  console.log('Step 1: Creating migration...');
  execSync('pnpm prisma migrate dev --name add_notary_network_models', {
    stdio: 'inherit',
    cwd: rootDir,
  });

  console.log('\n✅ Migration created successfully!\n');

  // Generate Prisma client
  console.log('Step 2: Generating Prisma Client...');
  execSync('pnpm prisma generate', {
    stdio: 'inherit',
    cwd: rootDir,
  });

  console.log('\n✅ Prisma Client generated successfully!\n');
  console.log('🎉 Migration complete! All Notary Network models are now in the database.\n');
  
} catch (error) {
  console.error('\n❌ Migration failed:', error.message);
  console.error('\nPlease run the commands manually:');
  console.error('1. pnpm prisma migrate dev --name add_notary_network_models');
  console.error('2. pnpm prisma generate');
  process.exit(1);
}

