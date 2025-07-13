import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract web vitals data
    const {
      metric,
      value,
      rating,
      timestamp,
      url,
      userAgent
    } = body;

    // Log the web vitals data
    console.log('📊 Web Vitals Data:', {
      metric,
      value,
      rating,
      timestamp,
      url,
      userAgent
    });

    // In a production environment, you would typically:
    // 1. Store this data in a database
    // 2. Send to analytics service like Google Analytics
    // 3. Send to monitoring service like DataDog, New Relic, etc.
    
    // For now, we'll just return success
    return NextResponse.json({ 
      success: true, 
      message: 'Web vitals data received' 
    });
    
  } catch (error) {
    console.error('Error processing web vitals data:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process web vitals data' 
    }, { status: 500 });
  }
} 