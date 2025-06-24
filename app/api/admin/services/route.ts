import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';
import { Role, ServiceType } from '@prisma/client';

// GET /api/admin/services - List all services with stats
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check admin authentication
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    const serviceType = searchParams.get('serviceType') as ServiceType;

    const services = await prisma.service.findMany({
      where: {
        ...(active !== null && { active: active === 'true' }),
        ...(serviceType && { serviceType })
      },
      include: {
        _count: {
          select: {
            bookings: true
          }
        }
      },
      orderBy: [
        { active: 'desc' },
        { serviceType: 'asc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json({
      success: true,
      services: services.map(service => ({
        id: service.id,
        name: service.name,
        description: service.description,
        serviceType: service.serviceType,
        duration: service.duration,
        price: Number(service.price),
        requiresDeposit: service.requiresDeposit,
        depositAmount: service.depositAmount ? Number(service.depositAmount) : null,
        active: service.active,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
        bookingCount: service._count.bookings
      }))
    });

  } catch (error) {
    console.error('Services fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

// POST /api/admin/services - Create new service
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check admin authentication
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      name, 
      description, 
      serviceType, 
      duration, 
      price, 
      requiresDeposit, 
      depositAmount, 
      active 
    } = body;

    // Validate required fields
    if (!name || !serviceType || !duration || price === undefined) {
      return NextResponse.json(
        { error: 'Name, service type, duration, and price are required' },
        { status: 400 }
      );
    }

    // Validate service type
    if (!Object.values(ServiceType).includes(serviceType)) {
      return NextResponse.json(
        { error: 'Invalid service type' },
        { status: 400 }
      );
    }

    // Validate pricing
    if (price < 0) {
      return NextResponse.json(
        { error: 'Price must be positive' },
        { status: 400 }
      );
    }

    if (requiresDeposit && (!depositAmount || depositAmount <= 0)) {
      return NextResponse.json(
        { error: 'Deposit amount is required when deposit is enabled' },
        { status: 400 }
      );
    }

    // Create service
    const service = await prisma.service.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        serviceType,
        duration: parseInt(duration),
        price: parseFloat(price),
        requiresDeposit: requiresDeposit || false,
        depositAmount: requiresDeposit ? parseFloat(depositAmount) : null,
        active: active !== undefined ? active : true
      }
    });

    return NextResponse.json({
      success: true,
      service: {
        id: service.id,
        name: service.name,
        description: service.description,
        serviceType: service.serviceType,
        duration: service.duration,
        price: Number(service.price),
        requiresDeposit: service.requiresDeposit,
        depositAmount: service.depositAmount ? Number(service.depositAmount) : null,
        active: service.active,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt
      }
    });

  } catch (error) {
    console.error('Service creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    );
  }
} 