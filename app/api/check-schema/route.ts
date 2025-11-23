import { NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/security/rate-limiting';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { prisma } from '@/lib/database-connection';
import { Prisma } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withRateLimit('admin', 'check_schema')(async () => {
  try {
    console.log('🔍 Checking production database schema...');
    
    // Check Service table structure
    const tableStructure = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'Service'
      ORDER BY ordinal_position
    ` as any[];
    
    console.log('📋 Service table structure:', tableStructure);
    
    // Try different column name variations
    // SECURITY FIX: Use Prisma.sql for safe parameterized queries
    // Note: Column names cannot be parameterized, but since these are hardcoded admin-only values,
    // this is safe. For user input, we would need to whitelist column names.
    const testQueries = [
      { name: 'durationMinutes', column: 'durationMinutes' },
      { name: 'duration_minutes', column: 'duration_minutes' },
      { name: 'duration', column: 'duration' },
    ];
    
    const results: Record<string, string> = {};
    
    for (const test of testQueries) {
      try {
        await prisma.$queryRaw`SELECT 1 FROM "Service" LIMIT 1`;
        // SECURITY NOTE: Column names are hardcoded admin values, not user input
        // Using Prisma.sql template literal is safe here since column is from our controlled array
        const result = await prisma.$queryRaw(Prisma.sql`SELECT ${Prisma.raw(`"${test.column}"`)} FROM "Service" LIMIT 1`);
        results[test.name as keyof typeof results] = 'EXISTS';
      } catch (error) {
        results[test.name as keyof typeof results] = error instanceof Error ? getErrorMessage(error) : 'FAILED';
      }
    }
    
    // Get sample data using only basic columns
    const sampleData = await prisma.$queryRaw`
      SELECT id, name, "serviceType", "basePrice", "isActive"
      FROM "Service"
      LIMIT 3
    ` as any[];
    
    return NextResponse.json({
      success: true,
      schema: {
        columns: tableStructure,
        columnTests: results,
        sampleData: sampleData,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Schema check failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Schema check failed',
      details: {
        message: error instanceof Error ? getErrorMessage(error) : String(error),
        type: error?.constructor?.name || 'UnknownError',
        timestamp: new Date().toISOString(),
      }
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
})
