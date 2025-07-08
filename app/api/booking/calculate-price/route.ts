/**
 * Simple Pricing API - Houston Mobile Notary Pros
 * Basic price calculation: service + distance
 */

import { NextRequest, NextResponse } from 'next/server';
import { UnifiedDistanceService } from '@/lib/maps/unified-distance-service';

const SERVICE_PRICES = {
  'QUICK_STAMP_LOCAL': 50,        // NEW: Fast local signings
  'STANDARD_NOTARY': 75,
  'EXTENDED_HOURS': 100,
  'LOAN_SIGNING': 150,
  'RON_SERVICES': 35,
  'BUSINESS_ESSENTIALS': 125,     // NEW: Monthly subscription
  'BUSINESS_GROWTH': 349          // NEW: Premium subscription
};

function calculateTravelFee(distance: number, serviceType: string): number {
  // Quick-Stamp Local has 10-mile radius, all other mobile services have 30-mile radius
  const freeRadius = serviceType === 'QUICK_STAMP_LOCAL' ? 10 : 30;
  
  if (distance <= freeRadius) return 0;  
  return (distance - freeRadius) * 0.50; // $0.50 per mile beyond free radius
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
        travelFee = calculateTravelFee(distanceResult.distance.miles, serviceType);
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