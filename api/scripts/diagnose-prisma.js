/**
 * Prisma Diagnostic Script
 * 
 * This script helps diagnose issues with Prisma client and database models
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('==========================================');
console.log('Prisma Diagnostic Tool');
console.log('==========================================');
console.log('Working directory:', process.cwd());
console.log('Script directory:', __dirname);

async function runDiagnostics() {
  try {
    console.log('\n1. Creating Prisma Client...');
    const prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
    
    console.log('\n2. Checking available models on Prisma client...');
    const clientKeys = Object.keys(prisma);
    console.log('Available client keys:', clientKeys);

    console.log('\n3. Attempting database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Check for Role model
    console.log('\n4. Checking Role model...');
    if (prisma.role) {
      console.log('✅ Role model is defined on the Prisma client');
      
      try {
        const rolesCount = await prisma.role.count();
        console.log(`✅ Found ${rolesCount} roles in the database`);
        
        if (rolesCount > 0) {
          const roles = await prisma.role.findMany();
          console.log('Existing roles:', roles.map(r => r.name));
        }
      } catch (error) {
        console.error('❌ Error accessing Role model:', error.message);
      }
    } else {
      console.error('❌ Role model is NOT defined on the Prisma client');
      
      // Debug: Check for capitalization issues
      for (const key of clientKeys) {
        if (key.toLowerCase() === 'role') {
          console.log(`Found model with similar name: ${key}`);
        }
      }
    }
    
    // Check if User model exists
    console.log('\n5. Checking User model...');
    if (prisma.user) {
      console.log('✅ User model is defined on the Prisma client');
      
      try {
        const usersCount = await prisma.user.count();
        console.log(`✅ Found ${usersCount} users in the database`);
      } catch (error) {
        console.error('❌ Error accessing User model:', error.message);
      }
    } else {
      console.error('❌ User model is NOT defined on the Prisma client');
    }
    
    console.log('\n6. Validating Prisma schema...');
    try {
      const result = await prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`;
      console.log('Database tables:', result);
      
      // Check if our auth tables exist
      const authTables = ['roles', 'users', 'user_roles', 'refresh_tokens', 'login_attempts', 'api_keys'];
      const foundTables = result.map(r => r.tablename);
      
      for (const table of authTables) {
        if (foundTables.includes(table)) {
          console.log(`✅ Found table: ${table}`);
        } else {
          console.error(`❌ Missing table: ${table}`);
        }
      }
    } catch (error) {
      console.error('❌ Error querying database tables:', error.message);
    }
    
  } catch (error) {
    console.error('\n❌ Diagnostic failed with error:', error);
  } finally {
    console.log('\n==========================================');
  }
}

// Run the diagnostics
runDiagnostics().catch(console.error);
