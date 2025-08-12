import { NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/security/rate-limiting';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { prisma } from '@/lib/database-connection';

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
    const testQueries = [
      { name: 'durationMinutes', query: `SELECT "durationMinutes" FROM "Service" LIMIT 1` },
      { name: 'duration_minutes', query: `SELECT "duration_minutes" FROM "Service" LIMIT 1` },
      { name: 'duration', query: `SELECT "duration" FROM "Service" LIMIT 1` },
    ];
    
    const results: Record<string, string> = {};
    
    for (const test of testQueries) {
      try {
        await prisma.$queryRaw`SELECT 1 FROM "Service" LIMIT 1`;
        const result = await prisma.$executeRaw`${test.query}`;
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
