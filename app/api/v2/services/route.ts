/**
 * 🚀 HMNP V2 Services API
 * Single source of truth for all service definitions
 * Bulletproof, fast, and reliable
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { ServiceType } from '@prisma/client';

// ============================================================================
// 🎯 SERVICE DEFINITIONS (Texas-compliant)
// ============================================================================

interface ServiceDefinition {
  id: string;
  name: string;
  type: ServiceType;
  description: string;
  basePrice: number;
  depositRequired: boolean;
  depositAmount?: number;
  duration: number;
  maxSigners: number;
  maxDocuments: number;
  features: string[];
  availability: string;
  serviceArea?: string;
  isActive: boolean;
}

// Master service catalog - single source of truth
const MASTER_SERVICES: ServiceDefinition[] = [
  // 📱 MOBILE SERVICES
  {
    id: 'standard-notary',
    name: 'Standard Notary',
    type: 'MOBILE',
    description: 'Mobile notary service for up to 2 documents and 2 signers',
    basePrice: 75.00,
    depositRequired: false,
    duration: 30,
    maxSigners: 2,
    maxDocuments: 2,
    features: [
      'Up to 2 documents',
      '1-2 signers',
      '15-mile radius included',
      'Standard business hours'
    ],
    availability: '9am-5pm Mon-Fri',
    serviceArea: '15-mile radius from Texas City, TX',
    isActive: true
  },
  {
    id: 'extended-hours-notary',
    name: 'Extended Hours Notary',
    type: 'MOBILE',
    description: 'Extended hours mobile notary service with increased capacity',
    basePrice: 100.00,
    depositRequired: true,
    depositAmount: 25.00,
    duration: 45,
    maxSigners: 2,
    maxDocuments: 5,
    features: [
      'Up to 5 documents',
      '2 signers maximum',
      '20-mile radius included',
      'Extended hours available',
      'Same-day booking'
    ],
    availability: '7am-9pm Daily',
    serviceArea: '20-mile radius from Texas City, TX',
    isActive: true
  },
  {
    id: 'loan-signing-specialist',
    name: 'Loan Signing Specialist',
    type: 'MOBILE',
    description: 'Specialized loan signing service for mortgage and real estate documents',
    basePrice: 150.00,
    depositRequired: true,
    depositAmount: 50.00,
    duration: 90,
    maxSigners: 4,
    maxDocuments: 999, // Unlimited
    features: [
      'Unlimited documents',
      'Up to 4 signers',
      '90-minute session',
      'Mortgage specialist',
      'Mobile service'
    ],
    availability: 'By appointment',
    serviceArea: '25-mile radius from Texas City, TX',
    isActive: true
  },
  
  // 💻 RON SERVICES (Texas-compliant pricing)
  {
    id: 'ron-acknowledgment',
    name: 'RON Acknowledgment',
    type: 'RON',
    description: 'Remote Online Notarization for acknowledgments - Texas compliant',
    basePrice: 35.00, // $25 RON fee + $10 notarial act (Texas max)
    depositRequired: false,
    duration: 15,
    maxSigners: 1,
    maxDocuments: 1,
    features: [
      'Remote online service',
      'No travel required',
      'Digital recording',
      '24/7 availability',
      'Texas-compliant'
    ],
    availability: '24/7 availability',
    isActive: true
  },
  {
    id: 'ron-oath',
    name: 'RON Oath/Affirmation',
    type: 'RON',
    description: 'Remote Online Notarization for oaths and affirmations',
    basePrice: 35.00, // $25 RON fee + $10 notarial act (Texas max)
    depositRequired: false,
    duration: 15,
    maxSigners: 1,
    maxDocuments: 1,
    features: [
      'Remote online service',
      'No travel required',
      'Digital recording',
      '24/7 availability',
      'Texas-compliant'
    ],
    availability: '24/7 availability',
    isActive: true
  }
];

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

    // Filter services based on query parameters
    let services = MASTER_SERVICES;
    
    // Filter by type
    if (query.type !== 'ALL') {
      services = services.filter(service => service.type === query.type);
    }
    
    // Filter by active status
    if (query.active === 'true') {
      services = services.filter(service => service.isActive);
    }
    
    // Remove pricing details if not requested
    if (query.include_pricing === 'false') {
      services = services.map(({ basePrice, depositRequired, depositAmount, ...service }) => service);
    }

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

export function getServiceById(serviceId: string): ServiceDefinition | null {
  return MASTER_SERVICES.find(service => service.id === serviceId) || null;
}

export function getActiveServices(type?: ServiceType): ServiceDefinition[] {
  let services = MASTER_SERVICES.filter(service => service.isActive);
  
  if (type) {
    services = services.filter(service => service.type === type);
  }
  
  return services;
}

export function validateServiceId(serviceId: string): boolean {
  return MASTER_SERVICES.some(service => service.id === serviceId && service.isActive);
}

// ============================================================================
// 📊 SERVICE METRICS
// ============================================================================

export function getServiceMetrics() {
  const activeServices = MASTER_SERVICES.filter(s => s.isActive);
  
  return {
    total: MASTER_SERVICES.length,
    active: activeServices.length,
    inactive: MASTER_SERVICES.length - activeServices.length,
    byType: {
      mobile: activeServices.filter(s => s.type === 'MOBILE').length,
      ron: activeServices.filter(s => s.type === 'RON').length
    },
    priceRange: {
      min: Math.min(...activeServices.map(s => s.basePrice)),
      max: Math.max(...activeServices.map(s => s.basePrice)),
      average: activeServices.reduce((sum, s) => sum + s.basePrice, 0) / activeServices.length
    }
  };
}