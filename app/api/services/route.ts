import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database-connection';

export async function GET() {
  try {
    // Get all active services for the simple booking system
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
        isActive: true,
      },
    });

    // Format services for the old booking system interface
    const formattedServices = services.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description || '',
      price: Number(service.basePrice),
      serviceType: service.serviceType,
      duration: service.durationMinutes,
      requiresDeposit: service.requiresDeposit,
      depositAmount: Number(service.depositAmount),
      active: service.isActive,
    }));

    return NextResponse.json({
      success: true,
      services: {
        all: formattedServices,
      },
    });

  } catch (error) {
    console.error('Services API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch services',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
