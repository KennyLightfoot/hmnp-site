import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Role, BookingStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Authorization check
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';
    const range = searchParams.get('range') || '30d';

    // Calculate date range (reuse logic from main analytics endpoint)
    const now = new Date();
    let fromDate: Date;

    switch (range) {
      case '7d':
        fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        fromDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // 30d
        fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Fetch data
    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: fromDate,
          lte: now,
        },
        status: {
          not: BookingStatus.CANCELLED_BY_CLIENT,
        },
      },
      include: {
        Service: true,
        bookingAddons: {
          include: { addon: true },
        },
        User_Booking_notaryIdToUser: true,
        serviceArea: true,
      },
    });

    let csvContent = '';
    let filename = '';

    switch (type) {
      case 'overview':
        filename = 'overview-analytics';
        csvContent = generateOverviewCSV(bookings);
        break;
      case 'services':
        filename = 'service-performance';
        csvContent = generateServicesCSV(bookings);
        break;
      case 'customers':
        filename = 'customer-analytics';
        csvContent = generateCustomersCSV(bookings);
        break;
      case 'geography':
        filename = 'geographic-analysis';
        csvContent = generateGeographyCSV(bookings);
        break;
      case 'notaries':
        filename = 'notary-performance';
        csvContent = generateNotariesCSV(bookings);
        break;
      default:
        return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });
    }

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

  } catch (error) {
    console.error('Analytics export error:', error);
    return NextResponse.json(
      { error: 'Failed to export analytics data' },
      { status: 500 }
    );
  }
}

function generateOverviewCSV(bookings: any[]): string {
  const header = 'Booking ID,Date,Service,Customer,Revenue,Status,Notary\n';
  
  const rows = bookings.map(booking => {
    const revenue = Number(booking.finalPrice || 0) + 
      (booking.bookingAddons?.reduce((sum: number, addon: any) => sum + Number(addon.totalPrice), 0) || 0);
    
    return [
      booking.id,
      new Date(booking.createdAt).toLocaleDateString(),
      booking.Service.name,
      booking.signerName || 'N/A',
      revenue.toFixed(2),
      booking.status,
      booking.User_Booking_notaryIdToUser?.name || 'Unassigned'
    ].join(',');
  }).join('\n');
  
  return header + rows;
}

function generateServicesCSV(bookings: any[]): string {
  const serviceStats = new Map<string, {
    bookings: number;
    revenue: number;
    avgValue: number;
  }>();

  bookings.forEach(booking => {
    const serviceName = booking.Service.name;
    const revenue = Number(booking.finalPrice || 0) + 
      (booking.bookingAddons?.reduce((sum: number, addon: any) => sum + Number(addon.totalPrice), 0) || 0);
    
    if (!serviceStats.has(serviceName)) {
      serviceStats.set(serviceName, { bookings: 0, revenue: 0, avgValue: 0 });
    }
    
    const stats = serviceStats.get(serviceName)!;
    stats.bookings += 1;
    stats.revenue += revenue;
  });

  // Calculate averages
  serviceStats.forEach(stats => {
    stats.avgValue = stats.revenue / stats.bookings;
  });

  const header = 'Service Name,Total Bookings,Total Revenue,Average Value,Profit Margin\n';
  
  const rows = Array.from(serviceStats.entries()).map(([serviceName, stats]) => {
    const margin = ((stats.revenue - (stats.revenue * 0.3)) / stats.revenue) * 100; // 30% cost assumption
    
    return [
      serviceName,
      stats.bookings.toString(),
      stats.revenue.toFixed(2),
      stats.avgValue.toFixed(2),
      margin.toFixed(1) + '%'
    ].join(',');
  }).join('\n');
  
  return header + rows;
}

function generateCustomersCSV(bookings: any[]): string {
  const customerStats = new Map<string, {
    bookings: number;
    revenue: number;
    lastBooking: Date;
  }>();

  bookings.forEach(booking => {
    const customerEmail = booking.signerEmail || 'unknown';
    const revenue = Number(booking.finalPrice || 0) + 
      (booking.bookingAddons?.reduce((sum: number, addon: any) => sum + Number(addon.totalPrice), 0) || 0);
    
    if (!customerStats.has(customerEmail)) {
      customerStats.set(customerEmail, { 
        bookings: 0, 
        revenue: 0, 
        lastBooking: new Date(booking.createdAt)
      });
    }
    
    const stats = customerStats.get(customerEmail)!;
    stats.bookings += 1;
    stats.revenue += revenue;
    
    if (new Date(booking.createdAt) > stats.lastBooking) {
      stats.lastBooking = new Date(booking.createdAt);
    }
  });

  const header = 'Customer Email,Customer Name,Total Bookings,Total Revenue,Average Value,Last Booking\n';
  
  const rows = Array.from(customerStats.entries()).map(([email, stats]) => {
    const customerName = bookings.find(b => b.signerEmail === email)?.signerName || 'N/A';
    const avgValue = stats.revenue / stats.bookings;
    
    return [
      email,
      customerName,
      stats.bookings.toString(),
      stats.revenue.toFixed(2),
      avgValue.toFixed(2),
      stats.lastBooking.toLocaleDateString()
    ].join(',');
  }).join('\n');
  
  return header + rows;
}

function generateGeographyCSV(bookings: any[]): string {
  const geoStats = new Map<string, {
    bookings: number;
    revenue: number;
    totalDistance: number;
  }>();

  bookings.forEach(booking => {
    const area = booking.serviceArea?.name || booking.addressCity || 'Other';
    const revenue = Number(booking.finalPrice || 0) + 
      (booking.bookingAddons?.reduce((sum: number, addon: any) => sum + Number(addon.totalPrice), 0) || 0);
    const distance = Number(booking.mileageMiles || 0);
    
    if (!geoStats.has(area)) {
      geoStats.set(area, { bookings: 0, revenue: 0, totalDistance: 0 });
    }
    
    const stats = geoStats.get(area)!;
    stats.bookings += 1;
    stats.revenue += revenue;
    stats.totalDistance += distance;
  });

  const header = 'Service Area,Total Bookings,Total Revenue,Average Distance (mi),Profit Margin\n';
  
  const rows = Array.from(geoStats.entries()).map(([area, stats]) => {
    const avgDistance = stats.totalDistance / stats.bookings;
    const profitMargin = ((stats.revenue - (stats.totalDistance * 0.65)) / stats.revenue) * 100;
    
    return [
      area,
      stats.bookings.toString(),
      stats.revenue.toFixed(2),
      avgDistance.toFixed(1),
      profitMargin.toFixed(1) + '%'
    ].join(',');
  }).join('\n');
  
  return header + rows;
}

function generateNotariesCSV(bookings: any[]): string {
  const notaryStats = new Map<string, {
    bookings: number;
    revenue: number;
    completedBookings: number;
  }>();

  bookings.forEach(booking => {
    const notaryName = booking.User_Booking_notaryIdToUser?.name || 'Unassigned';
    const revenue = Number(booking.finalPrice || 0) + 
      (booking.bookingAddons?.reduce((sum: number, addon: any) => sum + Number(addon.totalPrice), 0) || 0);
    
    if (!notaryStats.has(notaryName)) {
      notaryStats.set(notaryName, { 
        bookings: 0, 
        revenue: 0, 
        completedBookings: 0 
      });
    }
    
    const stats = notaryStats.get(notaryName)!;
    stats.bookings += 1;
    stats.revenue += revenue;
    
    if (booking.status === BookingStatus.COMPLETED) {
      stats.completedBookings += 1;
    }
  });

  const header = 'Notary Name,Total Bookings,Total Revenue,Completed Bookings,Completion Rate,Revenue per Booking\n';
  
  const rows = Array.from(notaryStats.entries()).map(([notaryName, stats]) => {
    const completionRate = (stats.completedBookings / stats.bookings) * 100;
    const revenuePerBooking = stats.revenue / stats.bookings;
    
    return [
      notaryName,
      stats.bookings.toString(),
      stats.revenue.toFixed(2),
      stats.completedBookings.toString(),
      completionRate.toFixed(1) + '%',
      revenuePerBooking.toFixed(2)
    ].join(',');
  }).join('\n');
  
  return header + rows;
} 