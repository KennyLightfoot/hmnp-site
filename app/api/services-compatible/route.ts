import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test basic database connectivity first
    await prisma.$queryRaw`SELECT 1`;
    
    // Check what columns exist in the Service table
    const columns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Service'
    ` as Array<{ column_name: string }>;
    
    const columnNames = columns.map(col => col.column_name);
    const hasIsActive = columnNames.includes('isActive');
    const hasDurationMinutes = columnNames.includes('durationMinutes');
    const hasBasePrice = columnNames.includes('basePrice');
    
    console.log('[SERVICES] Available columns:', columnNames);
    console.log('[SERVICES] Schema compatibility:', { hasIsActive, hasDurationMinutes, hasBasePrice });
    
    // Use raw SQL for maximum compatibility
    let services;
    if (hasIsActive && hasDurationMinutes && hasBasePrice) {
      // New schema - use proper Prisma queries
      services = await prisma.Service.findMany({
        where: { isActive: true },
        orderBy: [{ serviceType: 'asc' }, { name: 'asc' }],
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
          createdAt: true,
          updatedAt: true,
        },
      });
    } else {
      // Legacy schema - use raw SQL with fallbacks
      services = await prisma.$queryRaw`
        SELECT 
          id,
          name,
          description,
          ${hasBasePrice ? '"basePrice"' : 'COALESCE("price", 75.00) as "basePrice"'},
          ${hasDurationMinutes ? '"durationMinutes"' : '90 as "durationMinutes"'},
          ${hasIsActive ? '"isActive"' : 'true as "isActive"'},
          COALESCE("requiresDeposit", true) as "requiresDeposit",
          COALESCE("depositAmount", 25.00) as "depositAmount",
          "createdAt",
          "updatedAt",
          'STANDARD_NOTARY' as "serviceType"
        FROM "Service"
        ORDER BY name ASC
      ` as any[];
    }

    console.log('[SERVICES] Found', services.length, 'services');

    if (services.length === 0) {
      return NextResponse.json({
        success: true,
        services: { all: [], byType: {}, typeLabels: {} },
        meta: { 
          totalServices: 0, 
          serviceTypes: [],
          compatibility: { hasIsActive, hasDurationMinutes, hasBasePrice },
          message: 'No services found'
        },
      });
    }

    // Normalize services to consistent format
    const normalizedServices = services.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description || '',
      type: service.serviceType || 'STANDARD_NOTARY',
      typeLabel: 'Standard Notary Services',
      duration: Number(service.durationMinutes || 90),
      price: Number(service.basePrice || 75),
      requiresDeposit: Boolean(service.requiresDeposit),
      depositAmount: Number(service.depositAmount || 25),
      hasCalendarIntegration: false,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      services: {
        all: normalizedServices,
        byType: { STANDARD_NOTARY: normalizedServices },
        typeLabels: { STANDARD_NOTARY: 'Standard Notary Services' },
      },
      meta: {
        totalServices: normalizedServices.length,
        serviceTypes: ['STANDARD_NOTARY'],
        compatibility: { hasIsActive, hasDurationMinutes, hasBasePrice },
        schemaVersion: hasIsActive && hasDurationMinutes ? 'v2' : 'v1'
      },
    });

  } catch (error) {
    console.error('[SERVICES COMPATIBLE] Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch services',
      details: error instanceof Error ? error.message : String(error),
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}