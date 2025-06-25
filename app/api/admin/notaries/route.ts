import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Role } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Authorization check
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const includePerformance = searchParams.get('includePerformance') === 'true';

    // Build where clause
    const where: any = {
      role: {
        in: [Role.NOTARY, Role.ADMIN], // Include both notaries and admins who can act as notaries
      },
    };

    if (status && status !== 'ALL') {
      where.active = status === 'ACTIVE';
    }

    // Fetch notaries with related data
    const users = await prisma.user.findMany({
      where,
      include: {
        notaryProfile: true,
        Booking_Booking_notaryIdToUser: includePerformance ? {
          include: {
            Service: true,
            Payment: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        } : false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform data for the frontend
    const notaries = users.map(user => {
      const bookings = includePerformance ? user.Booking_Booking_notaryIdToUser || [] : [];
      
      // Calculate performance metrics
      const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
      const totalRevenue = bookings.reduce((sum, booking) => {
        const payments = booking.Payment?.filter(p => p.status === 'COMPLETED') || [];
        return sum + payments.reduce((pSum, payment) => pSum + Number(payment.amount), 0);
      }, 0);

      // Calculate average rating (placeholder - would need actual rating system)
      const averageRating = 4.2 + Math.random() * 0.8; // Placeholder

      // Service areas (from notary profile or default)
      const serviceAreas = user.notaryProfile?.serviceAreas ? 
        JSON.parse(user.notaryProfile.serviceAreas as string) : 
        [
          {
            id: 'houston-central',
            name: 'Houston Central',
            type: 'PRIMARY',
            maxDistance: 25,
            isActive: true,
          }
        ];

      // Availability (placeholder - would need actual scheduling system)
      const availability = {
        weeklySchedule: {
          monday: { start: '09:00', end: '17:00', isAvailable: true },
          tuesday: { start: '09:00', end: '17:00', isAvailable: true },
          wednesday: { start: '09:00', end: '17:00', isAvailable: true },
          thursday: { start: '09:00', end: '17:00', isAvailable: true },
          friday: { start: '09:00', end: '17:00', isAvailable: true },
          saturday: { start: '10:00', end: '16:00', isAvailable: true },
          sunday: { start: '12:00', end: '16:00', isAvailable: false },
        },
        currentCapacity: Math.floor(Math.random() * 40) + 60, // 60-100%
        maxCapacity: 100,
        nextAvailable: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000), // Within next week
      };

      // Commission settings
      const commission = {
        type: user.notaryProfile?.commissionType || 'PERCENTAGE',
        rate: user.notaryProfile?.commissionRate || 25,
        minimumPayout: 100,
        payoutSchedule: 'BIWEEKLY',
        totalEarned: totalRevenue * 0.25, // 25% commission
        pendingPayout: Math.floor(Math.random() * 500) + 100, // Placeholder
      };

      return {
        id: user.id,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        status: user.active ? 'ACTIVE' : 'INACTIVE',
        onboardingStatus: user.notaryProfile?.onboardingStatus || 'PENDING',
        certificationNumber: user.notaryProfile?.certificationNumber || '',
        certificationExpiry: user.notaryProfile?.certificationExpiry || new Date(),
        serviceAreas,
        availability,
        performance: {
          totalBookings: bookings.length,
          completedBookings,
          cancelledBookings: bookings.filter(b => b.status.includes('CANCELLED')).length,
          averageRating: Math.round(averageRating * 10) / 10,
          totalRatings: Math.floor(completedBookings * 0.8), // 80% of completed bookings have ratings
          onTimeRate: Math.floor(Math.random() * 15) + 85, // 85-100%
          revenue: totalRevenue,
          monthlyGrowth: Math.floor(Math.random() * 30) - 5, // -5% to +25%
        },
        commission,
        documents: [
          {
            id: 'cert-1',
            type: 'CERTIFICATION',
            status: 'APPROVED',
            uploadedAt: new Date(),
            expiryDate: user.notaryProfile?.certificationExpiry,
            fileName: 'notary_certification.pdf',
          },
          {
            id: 'insurance-1',
            type: 'INSURANCE',
            status: 'APPROVED',
            uploadedAt: new Date(),
            fileName: 'insurance_policy.pdf',
          },
        ],
      };
    });

    return NextResponse.json({
      success: true,
      notaries,
      totalCount: notaries.length,
      stats: {
        active: notaries.filter(n => n.status === 'ACTIVE').length,
        pending: notaries.filter(n => n.onboardingStatus === 'PENDING').length,
        totalRevenue: notaries.reduce((sum, n) => sum + n.performance.revenue, 0),
        averageRating: notaries.reduce((sum, n) => sum + n.performance.averageRating, 0) / notaries.length || 0,
      },
    });

  } catch (error) {
    console.error('Notaries API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notaries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Authorization check
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      email,
      phone,
      certificationNumber,
      certificationExpiry,
      serviceAreas,
      commissionRate,
      commissionType,
    } = body;

    // Create user and notary profile
    const newNotary = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name,
          email,
          phone,
          role: Role.NOTARY,
          active: true,
          timezone: 'America/Chicago',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Create notary profile
      const notaryProfile = await tx.notaryProfile.create({
        data: {
          id: `notary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: user.id,
          certificationNumber,
          certificationExpiry: new Date(certificationExpiry),
          commissionType: commissionType || 'PERCENTAGE',
          commissionRate: commissionRate || 25,
          serviceAreas: JSON.stringify(serviceAreas || []),
          onboardingStatus: 'PENDING',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return { user, notaryProfile };
    });

    // TODO: Send onboarding email with document upload instructions
    // TODO: Create onboarding tasks in task management system

    return NextResponse.json({
      success: true,
      notary: {
        id: newNotary.user.id,
        name: newNotary.user.name,
        email: newNotary.user.email,
        status: 'PENDING',
        onboardingStatus: 'PENDING',
      },
      message: 'Notary onboarding initiated successfully',
    });

  } catch (error) {
    console.error('Create notary error:', error);
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create notary' },
      { status: 500 }
    );
  }
} 