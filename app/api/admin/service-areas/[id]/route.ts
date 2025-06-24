import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';
import { Role } from '@prisma/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/service-areas/[id] - Get single service area
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

    const serviceArea = await prisma.serviceArea.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            bookings: true
          }
        }
      }
    });

    if (!serviceArea) {
      return NextResponse.json(
        { error: 'Service area not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      serviceArea: {
        id: serviceArea.id,
        name: serviceArea.name,
        description: serviceArea.description,
        polygonCoordinates: serviceArea.polygonCoordinates,
        serviceFeeMultiplier: Number(serviceArea.serviceFeeMultiplier),
        active: serviceArea.active,
        createdAt: serviceArea.createdAt,
        updatedAt: serviceArea.updatedAt,
        bookingCount: serviceArea._count.bookings
      }
    });

  } catch (error) {
    console.error('Service area fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service area' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/service-areas/[id] - Update service area
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
    const { name, description, polygonCoordinates, serviceFeeMultiplier, active } = body;

    // Check if service area exists
    const existingServiceArea = await prisma.serviceArea.findUnique({
      where: { id }
    });

    if (!existingServiceArea) {
      return NextResponse.json(
        { error: 'Service area not found' },
        { status: 404 }
      );
    }

    // Validate polygon coordinates if provided
    if (polygonCoordinates && (!polygonCoordinates.type || polygonCoordinates.type !== 'Polygon' || !polygonCoordinates.coordinates)) {
      return NextResponse.json(
        { error: 'Invalid polygon coordinates format. Must be GeoJSON Polygon.' },
        { status: 400 }
      );
    }

    // Update service area
    const updatedServiceArea = await prisma.serviceArea.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(polygonCoordinates && { polygonCoordinates }),
        ...(serviceFeeMultiplier !== undefined && { serviceFeeMultiplier }),
        ...(active !== undefined && { active })
      }
    });

    return NextResponse.json({
      success: true,
      serviceArea: {
        id: updatedServiceArea.id,
        name: updatedServiceArea.name,
        description: updatedServiceArea.description,
        polygonCoordinates: updatedServiceArea.polygonCoordinates,
        serviceFeeMultiplier: Number(updatedServiceArea.serviceFeeMultiplier),
        active: updatedServiceArea.active,
        createdAt: updatedServiceArea.createdAt,
        updatedAt: updatedServiceArea.updatedAt
      }
    });

  } catch (error) {
    console.error('Service area update error:', error);
    return NextResponse.json(
      { error: 'Failed to update service area' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/service-areas/[id] - Delete service area
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

    // Check if service area exists and has bookings
    const serviceArea = await prisma.serviceArea.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            bookings: true
          }
        }
      }
    });

    if (!serviceArea) {
      return NextResponse.json(
        { error: 'Service area not found' },
        { status: 404 }
      );
    }

    // Prevent deletion if service area has associated bookings
    if (serviceArea._count.bookings > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete service area with associated bookings. Deactivate instead.',
          bookingCount: serviceArea._count.bookings
        },
        { status: 400 }
      );
    }

    // Delete service area
    await prisma.serviceArea.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Service area deleted successfully'
    });

  } catch (error) {
    console.error('Service area deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete service area' },
      { status: 500 }
    );
  }
} 