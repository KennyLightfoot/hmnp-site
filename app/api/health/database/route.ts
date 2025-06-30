import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
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
        securityAuditLog: await prisma.securityAuditLog.count(),
        promoCodeUsage: await prisma.promoCodeUsage.count(),
        stripeWebhookLog: await prisma.stripeWebhookLog.count(),
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
          where: { securityFlags: { not: null } }
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
    const standardNotary = requiredServices.find(s => 
      s.serviceType === 'STANDARD_NOTARY' && s.basePrice.toNumber() === 75
    );
    const extendedHours = requiredServices.find(s => 
      s.serviceType === 'EXTENDED_HOURS_NOTARY' && s.basePrice.toNumber() === 100
    );
    const loanSigning = requiredServices.find(s => 
      s.serviceType === 'LOAN_SIGNING_SPECIALIST' && s.basePrice.toNumber() === 150
    );

    const compliance = {
      hasSopCompliantServices: !!(standardNotary && extendedHours && loanSigning),
      standardNotaryCorrect: !!standardNotary,
      extendedHoursCorrect: !!extendedHours,
      loanSigningCorrect: !!loanSigning,
      allServicesHaveDeposit: requiredServices.every(s => s.requiresDeposit),
      standardDepositAmount: requiredServices.every(s => 
        s.depositAmount && s.depositAmount.toNumber() === 25
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
        ...(checks.tables.securityAuditLog === 0 ? ['ℹ️ No security events logged yet (normal for new system)'] : [])
      ]
    });

  } catch (error) {
    console.error('Database health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}