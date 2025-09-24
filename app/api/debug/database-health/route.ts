import { NextResponse } from 'next/server';
import { withAdminSecurity } from '@/lib/security/comprehensive-security';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { prisma } from '@/lib/database-connection';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withAdminSecurity(async () => {
  const healthCheck: any = {
    timestamp: new Date().toISOString(),
    status: 'unknown',
    checks: {},
    database: {},
    recommendations: []
  };

  try {
    // Test 1: Basic connectivity
    console.log('🔍 Testing database connectivity...');
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1 as test`;
    const connectionTime = Date.now() - start;
    
    healthCheck.checks.connectivity = {
      status: 'PASS',
      responseTime: `${connectionTime}ms`,
      message: 'Database connection successful'
    };

    // Test 2: Check service table
    console.log('🔍 Checking Service table...');
    const [totalServices, activeServices] = await Promise.all([
      prisma.service.count(),
      prisma.service.count({ where: { isActive: true } })
    ]);
    
    healthCheck.database.services = {
      total: totalServices,
      active: activeServices,
      status: totalServices > 0 ? 'PASS' : 'FAIL'
    };
    
    if (totalServices === 0) {
      healthCheck.recommendations.push('Database needs seeding - run: npx ts-node scripts/fix-services-data.ts');
    }

    // Test 3: Check required service types
    console.log('🔍 Checking required service types...');
    const requiredTypes = ['STANDARD_NOTARY', 'EXTENDED_HOURS_NOTARY', 'LOAN_SIGNING_SPECIALIST'];
    const serviceTypeCheck: any = {};
    
    for (const type of requiredTypes) {
      const count = await prisma.service.count({
        where: { 
          serviceType: type as any,
          isActive: true 
        }
      });
      serviceTypeCheck[type as keyof typeof serviceTypeCheck] = {
        count,
        status: count > 0 ? 'PASS' : 'FAIL'
      };
      
      if (count === 0) {
        healthCheck.recommendations.push(`Missing active service of type: ${type}`);
      }
    }
    
    healthCheck.database.serviceTypes = serviceTypeCheck;

    // Test 4: Check recent migrations
    console.log('🔍 Checking migration history...');
    const migrationCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "_prisma_migrations" 
      WHERE finished_at IS NOT NULL
    ` as any[];
    
    healthCheck.database.migrations = {
      applied: migrationCount[0]?.count || 0,
      status: 'PASS'
    };

    // Test 5: Check table structure
    console.log('🔍 Checking Service table structure...');
    const tableStructure = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'Service'
      ORDER BY ordinal_position
    ` as any[];
    
    healthCheck.database.tableStructure = {
      columns: tableStructure.length,
      details: tableStructure,
      status: tableStructure.length > 0 ? 'PASS' : 'FAIL'
    };

    // Test 6: Sample data retrieval
    if (totalServices > 0) {
      console.log('🔍 Testing sample data retrieval...');
      try {
        const sampleServices = await prisma.service.findMany({
          take: 3,
          select: {
            id: true,
            name: true,
            serviceType: true,
            basePrice: true,
            isActive: true
          }
        });
        
        healthCheck.database.sampleData = {
          services: sampleServices,
          status: 'PASS'
        };
      } catch (error) {
        healthCheck.database.sampleData = {
          error: error instanceof Error ? getErrorMessage(error) : String(error),
          status: 'FAIL'
        };
        healthCheck.recommendations.push('Sample data retrieval failed - check database schema');
      }
    }

    // Overall status
    const allChecks = [
      healthCheck.checks.connectivity?.status,
      healthCheck.database.services?.status,
      healthCheck.database.migrations?.status,
      healthCheck.database.tableStructure?.status,
      healthCheck.database.sampleData?.status || 'PASS', // Optional check
      ...Object.values(serviceTypeCheck).map((check: any) => check.status)
    ];
    
    healthCheck.status = allChecks.every(status => status === 'PASS') ? 'HEALTHY' : 'UNHEALTHY';
    
    return NextResponse.json(healthCheck);
    
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    
    healthCheck.status = 'ERROR';
    healthCheck.error = {
      message: error instanceof Error ? getErrorMessage(error) : String(error),
      type: error?.constructor?.name || 'UnknownError'
    };
    healthCheck.recommendations.push('Database connection failed - check DATABASE_URL environment variable');
    
    return NextResponse.json(healthCheck, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
})
