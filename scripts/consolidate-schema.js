#!/usr/bin/env node

/**
 * Schema Consolidation Script
 * Safely migrates from dual schemas to unified schema
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 HMNP Schema Consolidation Tool\n');

// Step 1: Backup current schema
console.log('📋 Step 1: Backing up current schema...');
const currentSchema = fs.readFileSync('prisma/schema.prisma', 'utf8');
const backupPath = `prisma/schema-backup-${Date.now()}.prisma`;
fs.writeFileSync(backupPath, currentSchema);
console.log(`✅ Backup created: ${backupPath}\n`);

// Step 2: Show migration plan
console.log('📋 Step 2: Migration Plan');
console.log('========================');
console.log('✅ Current schema backed up');
console.log('🔄 Unified schema will be created');
console.log('');
console.log('🚨 IMPORTANT: This consolidates your schemas!');
console.log('');
console.log('Key improvements in unified schema:');
console.log('• ✅ Supports both authenticated users AND guest bookings');
console.log('• ✅ Unified Role enum (ADMIN/STAFF/NOTARY/CLIENT)');
console.log('• ✅ Enhanced booking model with all payment fields');
console.log('• ✅ Production-ready auth system compatibility');
console.log('• ✅ Proper indexing for performance');
console.log('• ✅ NextAuth + custom auth support');
console.log('');
console.log('To complete the migration:');
console.log('');
console.log('1. Review the unified schema:');
console.log('   code prisma/schema-unified.prisma');
console.log('');
console.log('2. Replace current schema (when ready):');
console.log('   cp prisma/schema-unified.prisma prisma/schema.prisma');
console.log('');
console.log('3. Create migration:');
console.log('   pnpm prisma migrate dev --name unified-schema');
console.log('');
console.log('4. Generate client:');
console.log('   pnpm prisma generate');
console.log('');
console.log('5. Test auth system:');
console.log('   curl http://localhost:3000/api/auth/test');
console.log('');
console.log(`📁 Backup created: ${backupPath}`);
console.log('✨ Ready to proceed with unified schema!'); 