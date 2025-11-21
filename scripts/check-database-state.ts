#!/usr/bin/env tsx
/**
 * Check Database State Before Upgrade
 * Documents current extensions, version, and configuration
 */

import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function checkDatabaseState() {
  console.log('🔍 Checking Database State...\n');

  try {
    // Check PostgreSQL version
    const versionResult = await prisma.$queryRaw<Array<{ version: string }>>`
      SELECT version();
    `;
    console.log('📊 PostgreSQL Version:');
    console.log(`   ${versionResult[0]?.version}\n`);

    // Check installed extensions
    const extensionsResult = await prisma.$queryRaw<Array<{ extname: string; extversion: string }>>`
      SELECT extname, extversion 
      FROM pg_extension 
      ORDER BY extname;
    `;
    console.log('🔌 Installed Extensions:');
    if (extensionsResult.length === 0) {
      console.log('   (none)');
    } else {
      extensionsResult.forEach(ext => {
        console.log(`   - ${ext.extname}: ${ext.extversion}`);
      });
    }
    console.log('');

    // Check database size
    const dbSizeResult = await prisma.$queryRaw<Array<{ size: string }>>`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size;
    `;
    console.log('💾 Database Size:');
    console.log(`   ${dbSizeResult[0]?.size}\n`);

    // Check table count
    const tableCountResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    `;
    console.log('📋 Tables:');
    console.log(`   ${tableCountResult[0]?.count} tables in public schema\n`);

    // Check connection info
    const connectionResult = await prisma.$queryRaw<Array<{ 
      current_database: string;
      current_user: string;
      inet_server_addr: string;
      inet_server_port: number;
    }>>`
      SELECT 
        current_database(),
        current_user,
        inet_server_addr(),
        inet_server_port();
    `;
    console.log('🔗 Connection Info:');
    console.log(`   Database: ${connectionResult[0]?.current_database}`);
    console.log(`   User: ${connectionResult[0]?.current_user}`);
    console.log(`   Server: ${connectionResult[0]?.inet_server_addr}:${connectionResult[0]?.inet_server_port}\n`);

    console.log('✅ Database state check complete!');
    console.log('\n💡 Save this information for reference after upgrade.');

  } catch (error) {
    console.error('❌ Error checking database state:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseState();

