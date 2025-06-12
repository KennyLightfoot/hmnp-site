import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
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
        createdAt: true,
        updatedAt: true,
      },
    });

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
        basePrice: Number(service.basePrice),
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
        all: services.map(service => ({
          id: service.id,
          name: service.name,
          description: service.description,
          type: service.serviceType,
          typeLabel: serviceTypeLabels[service.serviceType] || service.serviceType,
          duration: service.durationMinutes,
          basePrice: Number(service.basePrice),
          requiresDeposit: service.requiresDeposit,
          depositAmount: service.requiresDeposit ? Number(service.depositAmount) : 0,
          hasCalendarIntegration: !!service.externalCalendarId,
          createdAt: service.createdAt,
          updatedAt: service.updatedAt,
        })),
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
        error: 'Failed to fetch services'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
