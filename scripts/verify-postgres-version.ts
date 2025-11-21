#!/usr/bin/env tsx
/**
 * Verify PostgreSQL Version After Upgrade
 */

import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function verifyVersion() {
  console.log('🔍 Verifying PostgreSQL Version...\n');

  try {
    const versionResult = await prisma.$queryRaw<Array<{ version: string }>>`
      SELECT version();
    `;

    const versionString = versionResult[0]?.version || '';
    console.log('📊 Current Version:');
    console.log(`   ${versionString}\n`);

    // Extract version number (handles formats like "PostgreSQL 17.6" or "17.6.1")
    const versionMatch = versionString.match(/PostgreSQL (\d+)\.(\d+)(?:\.(\d+))?/);
    if (versionMatch) {
      const major = parseInt(versionMatch[1]);
      const minor = parseInt(versionMatch[2]);
      const patch = versionMatch[3] ? parseInt(versionMatch[3]) : 0;
      const version = `${major}.${minor}${patch > 0 ? `.${patch}` : ''}`;
      
      console.log(`✅ PostgreSQL ${version} detected`);
      
      // Check if upgrade was successful (should be >= 17.5 or higher patch of 17.4)
      if (major === 17) {
        if (minor > 4 || (minor === 4 && patch > 1)) {
          console.log('✅ Upgrade successful - running patched version!');
        } else if (minor === 6) {
          console.log('✅ Upgrade successful - running PostgreSQL 17.6!');
        } else {
          console.log(`⚠️  Version ${version} - upgrade may not have completed`);
        }
      } else if (major > 17) {
        console.log(`✅ Upgrade successful - running PostgreSQL ${version}!`);
      }
    } else {
      console.log('⚠️  Could not parse version string');
      console.log(`   Raw version: ${versionString}`);
    }

    console.log('\n✅ Version verification complete!');

  } catch (error) {
    console.error('❌ Error verifying version:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyVersion();

