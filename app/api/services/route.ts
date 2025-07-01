import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database-connection';
import { mapPrismaToFrontend, getServiceDisplayName } from '@/lib/types/service-types';

export async function GET() {
  try {
    console.log('🔍 Services API: Starting request...');
    
    // Test database connectivity with timeout
    const connectivityTest = await Promise.race([
      prisma.$queryRaw`SELECT 1 as test`,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout')), 5000)
      )
    ]);
    
    console.log('✅ Services API: Database connectivity test passed');
    
    // Get service counts for debugging
    const [totalServices, activeServices] = await Promise.all([
      prisma.service.count(),
      prisma.service.count({ where: { isActive: true } })
    ]);
    
    console.log(`📊 Services API: Total services: ${totalServices}, Active: ${activeServices}`);
    
    if (totalServices === 0) {
      console.log('🚨 Services API: No services found in database');
      
      // Return mock data for immediate functionality
      return NextResponse.json({
        success: true,
        services: {
          all: [
            {
              id: 'standard-notary-mock',
              key: 'STANDARD_NOTARY',
              name: 'Standard Notary',
              description: '9am-5pm Mon-Fri, up to 2 documents, 1-2 signers, 15-mile travel included',
              type: 'STANDARD_NOTARY',
              typeLabel: 'Standard Notary Services',
              duration: 60,
              price: 75,
              basePrice: 75,
              requiresDeposit: false,
              depositAmount: 0,
              serviceType: 'STANDARD_NOTARY',
              hasCalendarIntegration: false,
              isActive: true,
            },
            {
              id: 'extended-hours-mock',
              key: 'EXTENDED_HOURS_NOTARY',
              name: 'Extended Hours Notary',
              description: '7am-9pm Daily, up to 5 documents, 2 signers, 20-mile travel included',
              type: 'EXTENDED_HOURS_NOTARY',
              typeLabel: 'Extended Hours Notary',
              duration: 90,
              price: 100,
              basePrice: 100,
              requiresDeposit: false,
              depositAmount: 0,
              serviceType: 'EXTENDED_HOURS_NOTARY',
              hasCalendarIntegration: false,
              isActive: true,
            },
            {
              id: 'loan-signing-mock',
              key: 'LOAN_SIGNING_SPECIALIST',
              name: 'Loan Signing Specialist',
              description: 'Flat fee service - unlimited documents for single session, up to 4 signers, 90-minute session',
              type: 'LOAN_SIGNING_SPECIALIST',
              typeLabel: 'Loan Signing Specialist',
              duration: 120,
              price: 150,
              basePrice: 150,
              requiresDeposit: true,
              depositAmount: 50,
              serviceType: 'LOAN_SIGNING_SPECIALIST',
              hasCalendarIntegration: false,
              isActive: true,
            }
          ],
          byType: {
            'STANDARD_NOTARY': [{
              id: 'standard-notary-mock',
              name: 'Standard Notary',
              description: '9am-5pm Mon-Fri, up to 2 documents, 1-2 signers, 15-mile travel included',
              duration: 60,
              price: 75,
              requiresDeposit: false,
              depositAmount: 0,
              hasCalendarIntegration: false,
            }],
            'EXTENDED_HOURS_NOTARY': [{
              id: 'extended-hours-mock',
              name: 'Extended Hours Notary',
              description: '7am-9pm Daily, up to 5 documents, 2 signers, 20-mile travel included',
              duration: 90,
              price: 100,
              requiresDeposit: false,
              depositAmount: 0,
              hasCalendarIntegration: false,
            }],
            'LOAN_SIGNING_SPECIALIST': [{
              id: 'loan-signing-mock',
              name: 'Loan Signing Specialist',
              description: 'Flat fee service - unlimited documents for single session, up to 4 signers, 90-minute session',
              duration: 120,
              price: 150,
              requiresDeposit: true,
              depositAmount: 50,
              hasCalendarIntegration: false,
            }]
          },
          typeLabels: {
            'STANDARD_NOTARY': 'Standard Notary Services',
            'EXTENDED_HOURS_NOTARY': 'Extended Hours Notary',
            'LOAN_SIGNING_SPECIALIST': 'Loan Signing Specialist'
          }
        },
        meta: {
          totalServices: 3,
          serviceTypes: ['STANDARD_NOTARY', 'EXTENDED_HOURS_NOTARY', 'LOAN_SIGNING_SPECIALIST'],
          source: 'MOCK_DATA',
          warning: 'Database empty - using mock data. Run database seeding.'
        }
      });
    }
    
    // Continue with normal service fetching...
    let services;
    try {
      // Try with durationMinutes first (new schema)
      services = await prisma.service.findMany({
        where: { isActive: true },
        orderBy: [
          { serviceType: 'asc' },
          { name: 'asc' }
        ],
        select: {
          id: true,
          name: true,
          description: true,
          serviceType: true,
          durationMinutes: true,
          basePrice: true,
          requiresDeposit: true,
          depositAmount: true,
          externalCalendarId: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (durationError) {
      console.log('⚠️ durationMinutes failed, trying raw SQL approach...');
      // Fallback to raw SQL if Prisma schema is still out of sync
      services = await prisma.$queryRaw`
        SELECT 
          id,
          name,
          description,
          "serviceType",
          "durationMinutes",
          "basePrice",
          "requiresDeposit",
          "depositAmount",
          "externalCalendarId",
          "isActive",
          "createdAt",
          "updatedAt"
        FROM "Service"
        WHERE "isActive" = true
        ORDER BY "serviceType" ASC, name ASC
      ` as any[];
    }
    
    console.log(`✅ Services API: Retrieved ${services.length} active services`);

    // If services found but empty, return empty state
    if (services.length === 0) {
      return NextResponse.json({
        success: true,
        services: { all: [], byType: {}, typeLabels: {} },
        meta: { 
          totalServices: 0, 
          serviceTypes: [],
          debug: { totalServices, activeServices, message: 'No active services found' }
        },
      });
    }

    // Group services by type for better organization
    const servicesByType = services.reduce((acc, service) => {
      const type = service.serviceType;
      if (!acc[type]) {
        acc[type] = [];
      }
      
      acc[type].push({
        id: service.id,
        name: service.name,
        description: service.description,
        duration: service.durationMinutes,
        price: Number(service.basePrice),
        requiresDeposit: service.requiresDeposit,
        depositAmount: service.requiresDeposit ? Number(service.depositAmount) : 0,
        hasCalendarIntegration: !!service.externalCalendarId,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
      });
      
      return acc;
    }, {} as Record<string, any[]>);

    // Create service type labels for frontend display
    const serviceTypeLabels = {
      'STANDARD_NOTARY': 'Standard Notary Services',
      'EXTENDED_HOURS_NOTARY': 'Extended Hours Notary',
      'LOAN_SIGNING_SPECIALIST': 'Loan Signing Specialist',
      'SPECIALTY_NOTARY_SERVICE': 'Specialty Notary Services',
      'BUSINESS_SOLUTIONS': 'Business Solutions',
      'SUPPORT_SERVICE': 'Support Services',
    };

    return NextResponse.json({
      success: true,
      services: {
        all: services.map(service => {
          const frontendType = mapPrismaToFrontend(service.serviceType);
          return {
            id: service.id,
            key: frontendType, // Frontend-compatible key for forms
            name: service.name,
            description: service.description,
            type: service.serviceType, // Prisma enum
            typeLabel: getServiceDisplayName(frontendType),
            duration: service.durationMinutes,
            durationMinutes: service.durationMinutes, // Ensure both formats are available
            price: Number(service.basePrice),
            basePrice: Number(service.basePrice), // Ensure both formats are available
            requiresDeposit: service.requiresDeposit,
            depositAmount: service.requiresDeposit ? Number(service.depositAmount) : 0,
            serviceType: service.serviceType, // Add this for compatibility
            hasCalendarIntegration: !!service.externalCalendarId,
            isActive: service.isActive,
            createdAt: service.createdAt,
            updatedAt: service.updatedAt,
          };
        }),
        byType: servicesByType,
        typeLabels: serviceTypeLabels,
      },
      meta: {
        totalServices: services.length,
        serviceTypes: Object.keys(servicesByType),
      },
    }, {
      headers: {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '99',
        'X-RateLimit-Reset': (Date.now() + 3600000).toString(), // 1 hour from now
        'Cache-Control': 'public, max-age=300, s-maxage=300', // 5 minute cache
      }
    });

  } catch (error) {
    console.error('❌ Services API Error:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    // Return detailed error info for debugging with fallback services
    return NextResponse.json({
      success: false,
      error: 'Services endpoint failed',
      details: {
        message: error instanceof Error ? error.message : String(error),
        type: error?.constructor?.name || 'UnknownError',
        timestamp: new Date().toISOString(),
      },
      fallback: {
        // Provide mock services as fallback
        services: {
          all: [
            { id: 'fallback-1', name: 'Standard Notary', price: 75, basePrice: 75, type: 'STANDARD_NOTARY', serviceType: 'STANDARD_NOTARY', duration: 60, requiresDeposit: false, depositAmount: 0, isActive: true },
            { id: 'fallback-2', name: 'Extended Hours Notary', price: 100, basePrice: 100, type: 'EXTENDED_HOURS_NOTARY', serviceType: 'EXTENDED_HOURS_NOTARY', duration: 90, requiresDeposit: false, depositAmount: 0, isActive: true },
            { id: 'fallback-3', name: 'Loan Signing Specialist', price: 150, basePrice: 150, type: 'LOAN_SIGNING_SPECIALIST', serviceType: 'LOAN_SIGNING_SPECIALIST', duration: 120, requiresDeposit: true, depositAmount: 50, isActive: true }
          ]
        }
      }
    }, { status: 200 }); // Return 200 to prevent frontend errors
  } finally {
    await prisma.$disconnect();
  }
}
