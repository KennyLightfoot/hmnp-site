import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        serviceType: true,
        durationMinutes: true,
        basePrice: true,
        requiresDeposit: true,
        depositAmount: true,
      },
      orderBy: { name: 'asc' },
    });

    const formatted = services.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      serviceType: s.serviceType,
      duration: s.durationMinutes,
      price: Number(s.basePrice),
      requiresDeposit: s.requiresDeposit,
      depositAmount: s.depositAmount ? Number(s.depositAmount) : null,
    }));

    return NextResponse.json({ services: formatted });
  } catch (error) {
    console.error('V2 services API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
} 