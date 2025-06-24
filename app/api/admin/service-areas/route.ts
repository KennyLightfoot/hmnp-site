import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';
import { Role } from '@prisma/client';

// GET /api/admin/service-areas - List all service areas
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

    const serviceAreas = await prisma.serviceArea.findMany({
      where: active !== null ? { active: active === 'true' } : undefined,
      orderBy: [
        { active: 'desc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json({
      success: true,
      serviceAreas: serviceAreas.map(area => ({
        id: area.id,
        name: area.name,
        description: area.description,
        polygonCoordinates: area.polygonCoordinates,
        serviceFeeMultiplier: Number(area.serviceFeeMultiplier),
        active: area.active,
        createdAt: area.createdAt,
        updatedAt: area.updatedAt
      }))
    });

  } catch (error) {
    console.error('Service areas fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service areas' },
      { status: 500 }
    );
  }
}

// POST /api/admin/service-areas - Create new service area
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
    const { name, description, polygonCoordinates, serviceFeeMultiplier, active } = body;

    // Validate required fields
    if (!name || !polygonCoordinates) {
      return NextResponse.json(
        { error: 'Name and polygon coordinates are required' },
        { status: 400 }
      );
    }

    // Validate polygon coordinates format (GeoJSON)
    if (!polygonCoordinates.type || polygonCoordinates.type !== 'Polygon' || !polygonCoordinates.coordinates) {
      return NextResponse.json(
        { error: 'Invalid polygon coordinates format. Must be GeoJSON Polygon.' },
        { status: 400 }
      );
    }

    // Create service area
    const serviceArea = await prisma.serviceArea.create({
      data: {
        name,
        description: description || null,
        polygonCoordinates,
        serviceFeeMultiplier: serviceFeeMultiplier || 1.0,
        active: active !== undefined ? active : true
      }
    });

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
        updatedAt: serviceArea.updatedAt
      }
    });

  } catch (error) {
    console.error('Service area creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create service area' },
      { status: 500 }
    );
  }
} 