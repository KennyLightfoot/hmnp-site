import { NextRequest, NextResponse } from 'next/server';

/**
 * Availability Compatible API - Mock endpoint for diagnostic compatibility
 * Returns mock time slots for testing purposes
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const serviceId = searchParams.get('serviceId');
    const serviceDuration = searchParams.get('serviceDuration');

    // Generate mock time slots for the requested date
    const timeSlots = [
      { time: '09:00', available: true, demand: 'low' },
      { time: '10:00', available: true, demand: 'medium' },
      { time: '11:00', available: false, demand: 'high' },
      { time: '13:00', available: true, demand: 'medium' },
      { time: '14:00', available: true, demand: 'low' },
      { time: '15:00', available: true, demand: 'high' },
      { time: '16:00', available: false, demand: 'high' },
      { time: '17:00', available: true, demand: 'medium' }
    ];

    // Filter based on service type if provided
    let filteredSlots = timeSlots;
    if (serviceId === 'STANDARD_NOTARY') {
      // Standard notary only during business hours
      filteredSlots = timeSlots.filter(slot => {
        const hour = parseInt(slot.time.split(':')[0]);
        return hour >= 9 && hour <= 17;
      });
    } else if (serviceId === 'RON_SERVICES') {
      // RON available 24/7, add more slots
      filteredSlots = [
        ...timeSlots,
        { time: '07:00', available: true, demand: 'low' },
        { time: '08:00', available: true, demand: 'medium' },
        { time: '18:00', available: true, demand: 'medium' },
        { time: '19:00', available: true, demand: 'low' },
        { time: '20:00', available: true, demand: 'low' }
      ].sort((a, b) => a.time.localeCompare(b.time));
    }

    return NextResponse.json({
      success: true,
      availableSlots: filteredSlots,
      meta: {
        date: date || new Date().toISOString().split('T')[0],
        serviceId: serviceId || 'all',
        serviceDuration: serviceDuration || '90',
        totalSlots: filteredSlots.length,
        availableSlots: filteredSlots.filter(slot => slot.available).length,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    });

  } catch (error) {
    console.error('Availability API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch availability'
    }, { status: 500 });
  }
} 