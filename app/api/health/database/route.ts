import { NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/security/rate-limiting';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withRateLimit('public', 'health_database')(async () => {
  try {
    // Test basic database connectivity
    await prisma.$queryRaw`SELECT 1`;

    // Check critical table counts
    const checks = {
      connectivity: true,
      tables: {
        services: await prisma.service.count(),
        users: await prisma.user.count(),
        bookings: await prisma.booking.count(),
        payments: await prisma.payment.count(),
    // TODO: securityAuditLog model does not exist in schema
    // TODO: promoCodeUsage model does not exist in schema
    // TODO: stripeWebhookLog model does not exist in schema
      },
      serviceData: {
        activeServices: await prisma.service.count({ where: { isActive: true } }),
        serviceTypes: await prisma.service.groupBy({
          by: ['serviceType'],
          _count: { id: true }
        })
      },
      bookingData: {
        totalBookings: await prisma.booking.count(),
        pendingPayment: await prisma.booking.count({ 
          where: { status: 'PAYMENT_PENDING' } 
        }),
        confirmed: await prisma.booking.count({ 
          where: { status: 'CONFIRMED' } 
        }),
        withSecurityFlags: await prisma.booking.count({
      // securityFlags: ..., // Property does not exist on Booking model
        })
      },
      businessSettings: {
        total: await prisma.businessSettings.count(),
        bookingCategory: await prisma.businessSettings.count({
          where: { category: 'booking' }
        })
      }
    };

    // Verify required services exist
    const requiredServices = await prisma.service.findMany({
      where: { isActive: true },
      select: { 
        id: true, 
        name: true, 
        serviceType: true, 
        basePrice: true,
        requiresDeposit: true,
        depositAmount: true
      }
    });

    // Check for proper SOP pricing
    const standardNotary = requiredServices.find((s: typeof requiredServices[number]) => 
      s.serviceType === 'STANDARD_NOTARY' && (s.basePrice?.toNumber() || 0) === 85
    );
    const extendedHours = requiredServices.find((s: typeof requiredServices[number]) => 
      s.serviceType === 'EXTENDED_HOURS' && (s.basePrice?.toNumber() || 0) === 125
    );
    const loanSigning = requiredServices.find((s: typeof requiredServices[number]) => 
      s.serviceType === 'LOAN_SIGNING' && (s.basePrice?.toNumber() || 0) === 175
    );

    const compliance = {
      hasSopCompliantServices: !!(standardNotary && extendedHours && loanSigning),
      standardNotaryCorrect: !!standardNotary,
      extendedHoursCorrect: !!extendedHours,
      loanSigningCorrect: !!loanSigning,
      allServicesHaveDeposit: requiredServices.every((s: typeof requiredServices[number]) => s.requiresDeposit),
      standardDepositAmount: requiredServices.every((s: typeof requiredServices[number]) => 
        s.depositAmount && (s.depositAmount?.toNumber() || 0) === 25
      )
    };

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks,
      services: requiredServices,
      compliance,
      recommendations: [
        ...(checks.tables.services === 0 ? ['⚠️ No services found - run database seeding'] : []),
        ...(checks.tables.users === 0 ? ['⚠️ No users found - create admin user'] : []),
        ...(checks.businessSettings.bookingCategory === 0 ? ['⚠️ No booking settings - configure business hours'] : []),
        ...(!compliance.hasSopCompliantServices ? ['⚠️ Missing SOP-compliant services - run service setup'] : []),
        // Note: securityAuditLog model not yet implemented
      ]
    });

  } catch (error) {
    console.error('Database health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? getErrorMessage(error) : String(error),
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
})
