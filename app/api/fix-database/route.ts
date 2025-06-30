/**
 * 🔧 EMERGENCY DATABASE FIX ENDPOINT
 * 
 * This endpoint helps diagnose and fix the database schema issues
 * by checking table structure and applying necessary migrations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database-connection';

export async function GET() {
  return NextResponse.json({
    message: 'Database Fix Endpoint',
    description: 'POST to this endpoint to check and fix database schema issues',
    usage: 'curl -X POST /api/fix-database',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    checks: [],
    fixes: [],
    status: 'checking'
  };

  try {
    console.log('🔧 Starting database diagnostics...');

    // Check 1: Basic database connectivity
    try {
      await prisma.$queryRaw`SELECT 1 as test`;
      diagnostics.checks.push({
        name: 'Database Connectivity',
        status: 'PASS',
        details: 'Database connection successful'
      });
    } catch (error) {
      diagnostics.checks.push({
        name: 'Database Connectivity',
        status: 'FAIL',
        details: error instanceof Error ? error.message : 'Connection failed'
      });
      throw error;
    }

    // Check 2: Service table structure
    try {
      // Test if isActive column exists by using it in a query
      const activeCount = await prisma.service.count({
        where: { isActive: true }
      });
      
      diagnostics.checks.push({
        name: 'Service Table isActive Column',
        status: 'PASS',
        details: `Found ${activeCount} active services`
      });
    } catch (error) {
      diagnostics.checks.push({
        name: 'Service Table isActive Column',
        status: 'FAIL',
        details: error instanceof Error ? error.message : 'Column access failed'
      });

      // Try to add the missing column
      try {
        await prisma.$executeRaw`ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true`;
        diagnostics.fixes.push({
          name: 'Add isActive Column',
          status: 'APPLIED',
          details: 'Added isActive column to Service table'
        });
      } catch (fixError) {
        diagnostics.fixes.push({
          name: 'Add isActive Column',
          status: 'FAILED',
          details: fixError instanceof Error ? fixError.message : 'Fix failed'
        });
      }
    }

    // Check 3: Service data availability
    try {
      const services = await prisma.service.findMany({
        select: {
          id: true,
          name: true,
          isActive: true
        },
        take: 3
      });
      
      diagnostics.checks.push({
        name: 'Service Data Access',
        status: 'PASS',
        details: `Successfully retrieved ${services.length} services`,
        data: services
      });
    } catch (error) {
      diagnostics.checks.push({
        name: 'Service Data Access',
        status: 'FAIL',
        details: error instanceof Error ? error.message : 'Data access failed'
      });
    }

    // Check 4: Database schema sync
    try {
      // Check if we can run Prisma introspection
      const tableInfo = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'Service' 
        AND column_name = 'isActive'
      `;
      
      diagnostics.checks.push({
        name: 'Schema Sync Check',
        status: 'PASS',
        details: 'Database schema introspection successful',
        data: tableInfo
      });
    } catch (error) {
      diagnostics.checks.push({
        name: 'Schema Sync Check',
        status: 'FAIL',
        details: error instanceof Error ? error.message : 'Schema check failed'
      });
    }

    // Determine overall status
    const failedChecks = diagnostics.checks.filter(c => c.status === 'FAIL').length;
    const successfulFixes = diagnostics.fixes.filter(f => f.status === 'APPLIED').length;

    if (failedChecks === 0) {
      diagnostics.status = 'HEALTHY';
    } else if (successfulFixes > 0) {
      diagnostics.status = 'FIXED';
    } else {
      diagnostics.status = 'NEEDS_ATTENTION';
    }

    console.log('🔧 Database diagnostics completed:', {
      status: diagnostics.status,
      checks: diagnostics.checks.length,
      fixes: diagnostics.fixes.length
    });

    return NextResponse.json(diagnostics);

  } catch (error) {
    console.error('🔧 Database diagnostics failed:', error);
    
    diagnostics.status = 'ERROR';
    diagnostics.checks.push({
      name: 'Diagnostic Process',
      status: 'FAIL',
      details: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(diagnostics, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}