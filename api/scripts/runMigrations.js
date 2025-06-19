/**
 * Database Migration Script
 * Houston Mobile Notary Pros API
 * 
 * This script runs Prisma migrations to create or update database schema
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import 'dotenv/config';

const execPromise = promisify(exec);

/**
 * Colors for console output
 */
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

/**
 * Main migration function
 */
async function runMigrations() {
  console.log(`${colors.blue}Starting database migrations...${colors.reset}`);
  console.log(`${colors.yellow}DATABASE_URL: ${maskConnectionString(process.env.DATABASE_URL)}${colors.reset}`);

  try {
    // 1. Run migration to update the database schema
    console.log(`\n${colors.blue}Step 1: Generating migration from Prisma schema...${colors.reset}`);
    
    const migrationName = `auth_${new Date().toISOString().replace(/[:.]/g, '_')}`;
    
    const { stdout: migrationOut, stderr: migrationErr } = await execPromise(
      `npx prisma migrate dev --name ${migrationName} --preview-feature`
    );
    
    if (migrationErr) {
      console.error(`${colors.red}Migration error: ${migrationErr}${colors.reset}`);
    }
    
    console.log(`${colors.green}Migration output: ${migrationOut}${colors.reset}`);

    // 2. Generate Prisma client
    console.log(`\n${colors.blue}Step 2: Generating Prisma client...${colors.reset}`);
    
    const { stdout: generateOut, stderr: generateErr } = await execPromise(
      'npx prisma generate'
    );
    
    if (generateErr) {
      console.error(`${colors.red}Client generation error: ${generateErr}${colors.reset}`);
    }
    
    console.log(`${colors.green}Client generation output: ${generateOut}${colors.reset}`);

    // 3. Initialize auth schema
    console.log(`\n${colors.blue}Step 3: Running the auth initialization script...${colors.reset}`);
    
    const { stdout: initOut, stderr: initErr } = await execPromise(
      'node api/scripts/initAuth.js'
    );
    
    if (initErr) {
      console.error(`${colors.red}Auth initialization error: ${initErr}${colors.reset}`);
    }
    
    console.log(`${colors.green}Auth initialization output: ${initOut}${colors.reset}`);

    console.log(`\n${colors.green}✅ Database migration and setup completed successfully!${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}Error running migrations: ${error.message}${colors.reset}`);
    console.error(error);
    process.exit(1);
  }
}

/**
 * Mask database connection string for security
 */
function maskConnectionString(connectionString) {
  if (!connectionString) return 'Not found in environment';
  
  try {
    const url = new URL(connectionString);
    
    // Mask password if it exists
    if (url.password) {
      url.password = '****';
    }
    
    return url.toString();
  } catch (error) {
    return 'Invalid connection string';
  }
}

// Run migrations
runMigrations().catch(console.error);
