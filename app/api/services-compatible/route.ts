import { NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/security/rate-limiting';

/**
 * Services Compatible API - Mock endpoint for diagnostic compatibility
 * Returns hardcoded services that match the ServiceSelector component
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withRateLimit('public', 'services_compatible')(async () => {
  try {
    const services = {
      all: [
        {
          id: 'STANDARD_NOTARY',
          name: 'Standard Notary',
          description: 'Perfect for routine document notarization during business hours',
          basePrice: 85,
          duration: 90,
          serviceType: 'STANDARD_NOTARY',
          requiresDeposit: true,
          depositAmount: 25,
          hours: '9am-5pm Mon-Fri',
          maxDocuments: 2,
          includedRadius: 15,
          badge: 'popular'
        },
        {
          id: 'EXTENDED_HOURS',
          name: 'Extended Hours',
          description: 'Extended availability for urgent needs and after-hours appointments',
          basePrice: 100,
          duration: 90,
          serviceType: 'EXTENDED_HOURS_NOTARY',
          requiresDeposit: true,
          depositAmount: 25,
          hours: '7am-9pm Daily',
          maxDocuments: 5,
          includedRadius: 20,
          badge: 'recommended'
        },
        {
          id: 'LOAN_SIGNING',
          name: 'Loan Signing Specialist',
          description: 'Specialized expertise for loan documents and real estate transactions',
          basePrice: 150,
          duration: 180,
          serviceType: 'LOAN_SIGNING_SPECIALIST',
          requiresDeposit: true,
          depositAmount: 25,
          hours: 'By appointment',
          maxDocuments: 999,
          includedRadius: 20,
          badge: 'value'
        },
        {
          id: 'RON_SERVICES',
          name: 'Remote Online Notarization',
          description: 'Secure remote notarization from anywhere, available 24/7',
          basePrice: 25,
          duration: 60,
          serviceType: 'RON_SERVICES',
          requiresDeposit: true,
          depositAmount: 10,
          hours: '24/7 Availability',
          maxDocuments: 10,
          includedRadius: 0,
          urgencyText: 'Available now'
        }
      ]
    };

    return NextResponse.json({
      success: true,
      services,
      meta: {
        totalServices: services.all.length,
        serviceTypes: services.all.map(s => s.serviceType),
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    });

  } catch (error) {
    console.error('Services API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch services'
    }, { status: 500 });
  }
})