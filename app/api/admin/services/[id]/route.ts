import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';
import { Role, ServiceType } from '@prisma/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/services/[id] - Get single service
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    // Check admin authentication
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            bookings: true
          }
        }
      }
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

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
        updatedAt: service.updatedAt,
        bookingCount: service._count.bookings
      }
    });

  } catch (error) {
    console.error('Service fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/services/[id] - Update service
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    // Check admin authentication
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;
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

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id }
    });

    if (!existingService) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Validate service type if provided
    if (serviceType && !Object.values(ServiceType).includes(serviceType)) {
      return NextResponse.json(
        { error: 'Invalid service type' },
        { status: 400 }
      );
    }

    // Validate pricing if provided
    if (price !== undefined && price < 0) {
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

    // Update service
    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(serviceType && { serviceType }),
        ...(duration && { duration: parseInt(duration) }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(requiresDeposit !== undefined && { requiresDeposit }),
        ...(depositAmount !== undefined && { 
          depositAmount: requiresDeposit ? parseFloat(depositAmount) : null 
        }),
        ...(active !== undefined && { active })
      }
    });

    return NextResponse.json({
      success: true,
      service: {
        id: updatedService.id,
        name: updatedService.name,
        description: updatedService.description,
        serviceType: updatedService.serviceType,
        duration: updatedService.duration,
        price: Number(updatedService.price),
        requiresDeposit: updatedService.requiresDeposit,
        depositAmount: updatedService.depositAmount ? Number(updatedService.depositAmount) : null,
        active: updatedService.active,
        createdAt: updatedService.createdAt,
        updatedAt: updatedService.updatedAt
      }
    });

  } catch (error) {
    console.error('Service update error:', error);
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/services/[id] - Delete service
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    // Check admin authentication
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if service exists and has bookings
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            bookings: true
          }
        }
      }
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Prevent deletion if service has associated bookings
    if (service._count.bookings > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete service with associated bookings. Deactivate instead.',
          bookingCount: service._count.bookings
        },
        { status: 400 }
      );
    }

    // Delete service
    await prisma.service.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully'
    });

  } catch (error) {
    console.error('Service deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    );
  }
} 