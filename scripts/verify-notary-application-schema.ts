/**
 * Verify NotaryApplication table and enums exist in the database
 * This script helps diagnose migration issues for the notary application feature
 */

import * as dotenv from 'dotenv'
import { prisma } from '@/lib/db'
import { Prisma } from '@/lib/prisma-types'

// Load environment variables (try .env.local first, then .env)
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

async function verifyNotaryApplicationSchema() {
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL environment variable is not set')
    console.error('\nPlease ensure:')
    console.error('  1. You have a .env file with DATABASE_URL set')
    console.error('  2. Or run: dotenv -e .env -- pnpm db:verify-notary-schema')
    console.error('  3. Or set DATABASE_URL in your environment')
    process.exit(1)
  }

  console.log('🔍 Verifying NotaryApplication schema...\n')

  const checks: Array<{ name: string; passed: boolean; message: string }> = []

  try {
    // Check 1: Verify table exists
    console.log('1️⃣ Checking if NotaryApplication table exists...')
    try {
      const tableExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'NotaryApplication'
        ) as exists
      `
      
      if (tableExists[0]?.exists) {
        console.log('   ✅ NotaryApplication table exists')
        checks.push({ name: 'Table exists', passed: true, message: 'Table found' })
      } else {
        console.log('   ❌ NotaryApplication table does NOT exist')
        checks.push({ name: 'Table exists', passed: false, message: 'Table not found - migration needed' })
      }
    } catch (error) {
      console.log('   ❌ Error checking table:', error instanceof Error ? error.message : String(error))
      checks.push({ name: 'Table exists', passed: false, message: `Error: ${error instanceof Error ? error.message : String(error)}` })
    }

    // Check 2: Verify enum types exist
    console.log('\n2️⃣ Checking if enum types exist...')
    const enumTypes = ['NotaryApplicationStatus', 'JobOfferStatus']
    
    for (const enumType of enumTypes) {
      try {
        const enumExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
          SELECT EXISTS (
            SELECT FROM pg_type 
            WHERE typname = ${enumType}
          ) as exists
        `
        
        if (enumExists[0]?.exists) {
          console.log(`   ✅ ${enumType} enum exists`)
          checks.push({ name: `${enumType} enum`, passed: true, message: 'Enum found' })
        } else {
          console.log(`   ❌ ${enumType} enum does NOT exist`)
          checks.push({ name: `${enumType} enum`, passed: false, message: 'Enum not found - migration needed' })
        }
      } catch (error) {
        console.log(`   ❌ Error checking ${enumType}:`, error instanceof Error ? error.message : String(error))
        checks.push({ name: `${enumType} enum`, passed: false, message: `Error: ${error instanceof Error ? error.message : String(error)}` })
      }
    }

    // Check 3: Try to query the table (if it exists)
    console.log('\n3️⃣ Testing Prisma client access to NotaryApplication...')
    try {
      const count = await prisma.notaryApplication.count()
      console.log(`   ✅ Prisma client can access NotaryApplication (${count} records)`)
      checks.push({ name: 'Prisma client access', passed: true, message: `Found ${count} records` })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const prismaError = error as Prisma.PrismaClientKnownRequestError
        console.log(`   ❌ Prisma error: ${prismaError.code} - ${prismaError.message}`)
        checks.push({ 
          name: 'Prisma client access', 
          passed: false, 
          message: `Prisma error ${prismaError.code}: ${prismaError.message}` 
        })
      } else {
        console.log('   ❌ Error accessing table:', error instanceof Error ? error.message : String(error))
        checks.push({ 
          name: 'Prisma client access', 
          passed: false, 
          message: `Error: ${error instanceof Error ? error.message : String(error)}` 
        })
      }
    }

    // Check 4: Verify table structure (if table exists)
    console.log('\n4️⃣ Checking table structure...')
    try {
      const columns = await prisma.$queryRaw<Array<{ column_name: string; data_type: string }>>`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'NotaryApplication'
        ORDER BY ordinal_position
      `
      
      if (columns.length > 0) {
        console.log(`   ✅ Table has ${columns.length} columns`)
        const requiredColumns = ['id', 'email', 'firstName', 'lastName', 'status']
        const foundColumns = columns.map(c => c.column_name)
        const missingColumns = requiredColumns.filter(col => !foundColumns.includes(col))
        
        if (missingColumns.length === 0) {
          console.log('   ✅ All required columns present')
          checks.push({ name: 'Table structure', passed: true, message: 'All required columns found' })
        } else {
          console.log(`   ⚠️ Missing columns: ${missingColumns.join(', ')}`)
          checks.push({ name: 'Table structure', passed: false, message: `Missing columns: ${missingColumns.join(', ')}` })
        }
      } else {
        console.log('   ❌ Table structure not found')
        checks.push({ name: 'Table structure', passed: false, message: 'Cannot read table structure' })
      }
    } catch (error) {
      console.log('   ⚠️ Could not check table structure:', error instanceof Error ? error.message : String(error))
      checks.push({ name: 'Table structure', passed: false, message: `Error: ${error instanceof Error ? error.message : String(error)}` })
    }

    // Summary
    console.log('\n📊 Verification Summary:')
    console.log('=' .repeat(60))
    const passed = checks.filter(c => c.passed).length
    const failed = checks.filter(c => !c.passed).length
    
    checks.forEach(check => {
      const icon = check.passed ? '✅' : '❌'
      console.log(`${icon} ${check.name}: ${check.message}`)
    })
    
    console.log('\n' + '='.repeat(60))
    console.log(`Total: ${checks.length} checks | ✅ Passed: ${passed} | ❌ Failed: ${failed}`)
    
    if (failed > 0) {
      console.log('\n⚠️  ACTION REQUIRED:')
      console.log('   Some schema checks failed. Run the following to fix:')
      console.log('   1. pnpm db:migrate  (or: pnpm dotenv -e .env -- prisma migrate deploy)')
      console.log('   2. pnpm prisma:generate')
      console.log('   3. Re-run this script to verify')
      process.exit(1)
    } else {
      console.log('\n✅ All schema checks passed!')
      process.exit(0)
    }

  } catch (error) {
    console.error('\n💥 Fatal error during verification:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

verifyNotaryApplicationSchema()

