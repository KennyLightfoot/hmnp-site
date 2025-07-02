/**
 * 🚀 HMNP V2 Services API
 * Single source of truth for all service definitions
 * Bulletproof, fast, and reliable - reads from database
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { ServiceType } from '@prisma/client';

// ============================================================================
// 🛡️ REQUEST VALIDATION
// ============================================================================

const ServiceQuerySchema = z.object({
  type: z.string().nullable().optional().transform(val => val === 'MOBILE' || val === 'RON' ? val : 'ALL'),
  active: z.string().nullable().optional().transform(val => val === 'false' ? 'false' : 'true'),
  include_pricing: z.string().nullable().optional().transform(val => val === 'true' ? 'true' : 'false')
});

// ============================================================================
// 🎯 API HANDLERS
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = ServiceQuerySchema.parse({
      type: searchParams.get('type'),
      active: searchParams.get('active'),
      include_pricing: searchParams.get('include_pricing')
    });

    // Fetch services from database
    const dbServices = await prisma.service.findMany({
      where: {
        ...(query.type !== 'ALL' && { serviceType: query.type as ServiceType }),
        ...(query.active === 'true' && { isActive: true })
      },
      orderBy: [
        { serviceType: 'asc' },
        { name: 'asc' }
      ]
    });

    // Transform database services to API format
    const services = dbServices.map(service => {
      const baseService = {
        id: service.id,
        name: service.name,
        type: service.serviceType,
        description: service.description || `${service.name} service`,
        duration: service.estimatedDuration || 30,
        maxSigners: service.maxSigners || 2,
        maxDocuments: service.maxDocuments || 2,
        features: service.features || [],
        availability: service.availability || 'By appointment',
        serviceArea: service.serviceArea || 'Houston Metro Area',
        isActive: service.isActive
      };

      // Include pricing if requested
      if (query.include_pricing === 'true') {
        return {
          ...baseService,
          basePrice: service.basePrice || 0,
          depositRequired: Boolean(service.depositAmount && service.depositAmount > 0),
          depositAmount: service.depositAmount || 0
        };
      }

      return baseService;
    });

    return NextResponse.json({
      success: true,
      data: {
        services,
        total: services.length,
        types: {
          mobile: services.filter(s => s.type === 'MOBILE').length,
          ron: services.filter(s => s.type === 'RON').length
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '2.0'
      }
    });

  } catch (error) {
    console.error('Services API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'SERVICES_FETCH_ERROR',
        message: 'Failed to fetch services',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}

// ============================================================================
// 🎯 SERVICE UTILITIES
// ============================================================================

export async function getServiceById(serviceId: string) {
  return await prisma.service.findUnique({
    where: { id: serviceId }
  });
}

export async function getActiveServices(type?: ServiceType) {
  return await prisma.service.findMany({
    where: {
      isActive: true,
      ...(type && { serviceType: type })
    }
  });
}

export async function validateServiceId(serviceId: string): Promise<boolean> {
  const service = await prisma.service.findFirst({
    where: { 
      id: serviceId,
      isActive: true 
    }
  });
  return Boolean(service);
}

// ============================================================================
// 📊 SERVICE METRICS
// ============================================================================

export async function getServiceMetrics() {
  const services = await prisma.service.findMany();
  const activeServices = services.filter(s => s.isActive);
  
  return {
    total: services.length,
    active: activeServices.length,
    inactive: services.length - activeServices.length,
    byType: {
      mobile: activeServices.filter(s => s.serviceType === 'MOBILE').length,
      ron: activeServices.filter(s => s.serviceType === 'RON').length
    },
    priceRange: {
      min: Math.min(...activeServices.map(s => Number(s.basePrice) || 0)),
      max: Math.max(...activeServices.map(s => Number(s.basePrice) || 0)),
      average: activeServices.reduce((sum, s) => sum + (Number(s.basePrice) || 0), 0) / activeServices.length
    }
  };
}