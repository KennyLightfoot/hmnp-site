/**
 * EMERGENCY HOTFIX: Compatibility endpoint for services-compatible
 * 
 * This endpoint was being called by cached service workers or old client code,
 * causing 404 storms. This provides backward compatibility while we investigate.
 */

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  console.warn('⚠️ DEPRECATED: /api/services-compatible called - redirecting to /api/services');
  
  try {
    // Redirect to the main services endpoint
    const url = new URL(request.url);
    const servicesUrl = `${url.origin}/api/services${url.search}`;
    
    // Fetch from the real services endpoint
    const response = await fetch(servicesUrl, {
      headers: {
        'User-Agent': 'Internal-Compatibility-Layer'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Services endpoint failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Return the same data but add a deprecation warning
    return NextResponse.json({
      ...data,
      _deprecated: true,
      _message: 'This endpoint is deprecated. Use /api/services instead.',
      _timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Services-compatible endpoint error:', error);
    console.log('🔧 DIAGNOSTIC: Falling back to mock services data due to failure');
    
    // Enhanced mock services based on SOP_ENHANCED.md requirements
    const mockServices = {
      success: true,
      services: {
        all: [
          {
            id: 'standard-notary',
            key: 'STANDARD_NOTARY',
            name: 'Standard Notary',
            description: '9am-5pm Mon-Fri, up to 2 documents, 1-2 signers, 15-mile travel included',
            type: 'STANDARD_NOTARY',
            typeLabel: 'Standard Notary Services',
            duration: 60,
            price: 75,
            basePrice: 75,
            requiresDeposit: false,
            depositAmount: 0,
            serviceType: 'STANDARD_NOTARY',
            hasCalendarIntegration: false,
            isActive: true,
            maxDocuments: 2,
            maxSigners: 2,
            includedRadius: 15,
            hours: '9am-5pm Mon-Fri',
            features: ['Mobile service', 'Same-day available', 'Travel included']
          },
          {
            id: 'extended-hours-notary',
            key: 'EXTENDED_HOURS_NOTARY',
            name: 'Extended Hours Notary',
            description: '7am-9pm Daily, up to 5 documents, 2 signers, 20-mile travel included',
            type: 'EXTENDED_HOURS_NOTARY',
            typeLabel: 'Extended Hours Notary',
            duration: 90,
            price: 100,
            basePrice: 100,
            requiresDeposit: false,
            depositAmount: 0,
            serviceType: 'EXTENDED_HOURS_NOTARY',
            hasCalendarIntegration: false,
            isActive: true,
            maxDocuments: 5,
            maxSigners: 2,
            includedRadius: 20,
            hours: '7am-9pm Daily',
            features: ['Extended hours', 'Urgent/same-day', 'Travel included']
          },
          {
            id: 'loan-signing-specialist',
            key: 'LOAN_SIGNING_SPECIALIST',
            name: 'Loan Signing Specialist',
            description: 'Flat fee service - unlimited documents for single session, up to 4 signers, 90-minute session',
            type: 'LOAN_SIGNING_SPECIALIST',
            typeLabel: 'Loan Signing Specialist',
            duration: 90,
            price: 150,
            basePrice: 150,
            requiresDeposit: true,
            depositAmount: 50,
            serviceType: 'LOAN_SIGNING_SPECIALIST',
            hasCalendarIntegration: false,
            isActive: true,
            maxDocuments: 999,
            maxSigners: 4,
            sessionDuration: 90,
            hours: 'By appointment',
            features: ['Flat rate', 'Unlimited docs', 'Professional specialist']
          }
        ],
        byType: {
          'STANDARD_NOTARY': [{
            id: 'standard-notary',
            name: 'Standard Notary',
            description: '9am-5pm Mon-Fri, up to 2 documents, 1-2 signers, 15-mile travel included',
            duration: 60,
            price: 75,
            requiresDeposit: false,
            depositAmount: 0,
            hasCalendarIntegration: false
          }],
          'EXTENDED_HOURS_NOTARY': [{
            id: 'extended-hours-notary',
            name: 'Extended Hours Notary',
            description: '7am-9pm Daily, up to 5 documents, 2 signers, 20-mile travel included',
            duration: 90,
            price: 100,
            requiresDeposit: false,
            depositAmount: 0,
            hasCalendarIntegration: false
          }],
          'LOAN_SIGNING_SPECIALIST': [{
            id: 'loan-signing-specialist',
            name: 'Loan Signing Specialist',
            description: 'Flat fee service - unlimited documents for single session, up to 4 signers, 90-minute session',
            duration: 90,
            price: 150,
            requiresDeposit: true,
            depositAmount: 50,
            hasCalendarIntegration: false
          }]
        },
        typeLabels: {
          'STANDARD_NOTARY': 'Standard Notary Services',
          'EXTENDED_HOURS_NOTARY': 'Extended Hours Notary',
          'LOAN_SIGNING_SPECIALIST': 'Loan Signing Specialist'
        }
      },
      meta: {
        totalServices: 3,
        serviceTypes: ['STANDARD_NOTARY', 'EXTENDED_HOURS_NOTARY', 'LOAN_SIGNING_SPECIALIST']
      },
      _deprecated: true,
      _message: 'This endpoint is deprecated. Use /api/services instead.',
      _fallback: true,
      _source: 'MOCK_DATA'
    };
    
    return NextResponse.json(mockServices);
  }
}

// Handle other HTTP methods
export async function POST() {
  return NextResponse.json({
    error: 'Method not allowed',
    _deprecated: true,
    _message: 'This endpoint is deprecated. Use /api/services instead.'
  }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({
    error: 'Method not allowed', 
    _deprecated: true,
    _message: 'This endpoint is deprecated. Use /api/services instead.'
  }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({
    error: 'Method not allowed',
    _deprecated: true, 
    _message: 'This endpoint is deprecated. Use /api/services instead.'
  }, { status: 405 });
}