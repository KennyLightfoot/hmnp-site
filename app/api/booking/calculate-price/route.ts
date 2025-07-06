/**
 * Simple Pricing API - Houston Mobile Notary Pros
 * Basic price calculation: service + distance
 */

import { NextRequest, NextResponse } from 'next/server';
import { UnifiedDistanceService } from '@/lib/maps/unified-distance-service';

const SERVICE_PRICES = {
  'STANDARD_NOTARY': 75,
  'EXTENDED_HOURS': 100,
  'LOAN_SIGNING': 150,
  'RON_SERVICES': 35
};

function calculateTravelFee(distance: number): number {
  if (distance <= 15) return 0;  // Free within 15 miles
  return (distance - 15) * 0.50; // $0.50 per mile beyond 15
}

export async function POST(request: NextRequest) {
  try {
    const { serviceType, address } = await request.json();
    
    // Validate service type
    if (!serviceType || !SERVICE_PRICES[serviceType as keyof typeof SERVICE_PRICES]) {
      return NextResponse.json(
        { error: 'Invalid service type' },
        { status: 400 }
      );
    }

    const basePrice = SERVICE_PRICES[serviceType as keyof typeof SERVICE_PRICES];
    let travelFee = 0;

    // Calculate travel fee for mobile services
    if (address && serviceType !== 'RON_SERVICES') {
      try {
        const distanceResult = await UnifiedDistanceService.calculateDistance(address);
        travelFee = calculateTravelFee(distanceResult.distance.miles);
      } catch (error) {
        console.error('Distance calculation failed:', error);
        // Continue with 0 travel fee if distance calculation fails
      }
    }

    const totalPrice = basePrice + travelFee;

    return NextResponse.json({
      basePrice,
      travelFee,
      totalPrice
    });

  } catch (error) {
    console.error('Price calculation error:', error);
    return NextResponse.json(
      { error: 'Price calculation failed' },
      { status: 500 }
    );
  }
}