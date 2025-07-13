import { NextRequest, NextResponse } from 'next/server';
import { citationTracker } from '@/lib/citations/citation-tracker';

export async function POST(
  request: NextRequest,
  { params }: { params: { alertId: string } }
) {
  try {
    const { alertId } = params;
    
    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      );
    }

    // Get request body for optional resolution notes
    const body = await request.json().catch(() => ({}));
    const { resolutionNotes, actionTaken } = body;

    // Resolve the alert
    const success = citationTracker.resolveAlert(alertId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Alert not found or already resolved' },
        { status: 404 }
      );
    }

    console.log(`✅ Citation alert ${alertId} resolved successfully`);
    
    return NextResponse.json({
      success: true,
      message: 'Alert resolved successfully',
      alertId,
      resolvedAt: new Date().toISOString(),
      resolutionNotes: resolutionNotes || null,
      actionTaken: actionTaken || null
    });
  } catch (error) {
    console.error('❌ Error resolving alert:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to resolve alert',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 