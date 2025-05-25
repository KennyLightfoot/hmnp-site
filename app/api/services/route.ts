import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db'; // Corrected prisma client import path

export async function GET(request: Request) {
  try {
    const servicesFromDb = await prisma.service.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    const servicesApiShape = servicesFromDb.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      // The 'key' is the lowercase version of the ServiceType enum string, with special handling for loan_signing
      key: service.serviceType.toString().toLowerCase().replace('_', '-'), 
      durationMinutes: service.durationMinutes,
      basePrice: service.basePrice.toNumber(), // Convert Decimal to number
      isActive: service.isActive,
      requiresDeposit: service.requiresDeposit,
      depositAmount: service.depositAmount ? service.depositAmount.toNumber() : null, // Convert Decimal to number
      externalCalendarId: service.externalCalendarId,
      // Add any other fields from your Prisma Service model that ApiService on frontend might need
    }));

    console.log('!!!!!!!!!! /api/services RETURNING DATA (transformed):', JSON.stringify(servicesApiShape, null, 2)); // DEBUG LOG
    return NextResponse.json(servicesApiShape);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services. Please try again later.' },
      { status: 500 }
    );
  }
}
