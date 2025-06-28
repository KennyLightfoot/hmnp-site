import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test basic database connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    // Test the Service model specifically
    const totalServices = await prisma.Service.count();
    const activeServices = await prisma.Service.count({ where: { isActive: true } });
    
    // Get a few services to test the model works
    const services = await prisma.Service.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        serviceType: true,
        basePrice: true,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Services API test successful - Prisma model casing fixed',
      data: {
        totalServices,
        activeServices,
        sampleServices: services,
        prismaModelTest: 'prisma.Service.findMany() works correctly',
      },
    });

  } catch (error) {
    console.error('Services test API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Services test failed',
        details: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}