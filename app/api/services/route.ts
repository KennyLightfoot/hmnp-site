import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database-connection';
import { mapPrismaToFrontend, getServiceDisplayName } from '@/lib/types/service-types';

export async function GET() {
  try {
    // Test basic database connectivity first
    await prisma.$queryRaw`SELECT 1`;
    
    // Get total service count first
    const totalServices = await prisma.service.count();
    const activeServices = await prisma.service.count({ where: { isActive: true } });
    
    // Get all active services ordered by name
    const services = await prisma.service.findMany({
      where: { 
        isActive: true 
      },
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

    // Early return if no services found
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
            price: Number(service.basePrice),
            requiresDeposit: service.requiresDeposit,
            depositAmount: service.requiresDeposit ? Number(service.depositAmount) : 0,
            hasCalendarIntegration: !!service.externalCalendarId,
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
    });

  } catch (error) {
    console.error('Services API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch services',
        details: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
