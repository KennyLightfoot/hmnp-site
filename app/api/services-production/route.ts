import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database-connection';

export async function GET() {
  try {
    console.log('🔍 Production Services API: Starting request...');
    
    // Use raw SQL to bypass Prisma schema issues
    const services = await prisma.$queryRaw`
      SELECT 
        id,
        name,
        description,
        "serviceType",
        "durationMinutes",
        "basePrice",
        "requiresDeposit",
        "depositAmount",
        "isActive",
        "externalCalendarId",
        "createdAt",
        "updatedAt"
      FROM "Service"
      WHERE "isActive" = true
      ORDER BY "serviceType" ASC, name ASC
    ` as any[];
    
    console.log(`✅ Production Services API: Retrieved ${services.length} active services`);
    
    // Transform to expected format
    const transformedServices = services.map(service => ({
      id: service.id,
      key: service.serviceType,
      name: service.name,
      description: service.description,
      type: service.serviceType,
      typeLabel: getServiceDisplayName(service.serviceType),
      duration: service.durationMinutes,
      durationMinutes: service.durationMinutes,
      price: Number(service.basePrice),
      basePrice: Number(service.basePrice),
      requiresDeposit: service.requiresDeposit,
      depositAmount: service.requiresDeposit ? Number(service.depositAmount) : 0,
      serviceType: service.serviceType,
      hasCalendarIntegration: !!service.externalCalendarId,
      isActive: service.isActive,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    }));

    // Group by type
    const servicesByType = transformedServices.reduce((acc, service) => {
      const type = service.serviceType;
      if (!acc[type]) {
        acc[type] = [];
      }
      
      acc[type].push({
        id: service.id,
        name: service.name,
        description: service.description,
        duration: service.duration,
        price: service.price,
        requiresDeposit: service.requiresDeposit,
        depositAmount: service.depositAmount,
        hasCalendarIntegration: service.hasCalendarIntegration,
      });
      
      return acc;
    }, {} as Record<string, any[]>);

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
        all: transformedServices,
        byType: servicesByType,
        typeLabels: serviceTypeLabels,
      },
      meta: {
        totalServices: transformedServices.length,
        serviceTypes: Object.keys(servicesByType),
        source: 'PRODUCTION_DATABASE',
        timestamp: new Date().toISOString()
      },
    });

  } catch (error) {
    console.error('❌ Production Services API Error:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: false,
      error: 'Production services endpoint failed',
      details: {
        message: error instanceof Error ? error.message : String(error),
        type: error?.constructor?.name || 'UnknownError',
        timestamp: new Date().toISOString(),
      }
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

function getServiceDisplayName(serviceType: string): string {
  const displayNames = {
    'STANDARD_NOTARY': 'Standard Notary Services',
    'EXTENDED_HOURS_NOTARY': 'Extended Hours Notary',
    'LOAN_SIGNING_SPECIALIST': 'Loan Signing Specialist',
    'SPECIALTY_NOTARY_SERVICE': 'Specialty Notary Services',
    'BUSINESS_SOLUTIONS': 'Business Solutions',
    'SUPPORT_SERVICE': 'Support Services',
  };
  
  return displayNames[serviceType as keyof typeof displayNames] || serviceType;
}