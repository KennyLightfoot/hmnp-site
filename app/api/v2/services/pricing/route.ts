import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      select: {
        id: true,
        serviceType: true,
        basePrice: true,
        depositAmount: true,
        requiresDeposit: true,
      },
      orderBy: { serviceType: 'asc' },
    });

    const pricing = services.map(s => ({
      id: s.id,
      serviceType: s.serviceType,
      price: Number(s.basePrice),
      requiresDeposit: s.requiresDeposit,
      depositAmount: s.depositAmount ? Number(s.depositAmount) : null,
    }));

    return NextResponse.json({ pricing });
  } catch (error) {
    console.error('V2 services pricing API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service pricing' },
      { status: 500 }
    );
  }
} 