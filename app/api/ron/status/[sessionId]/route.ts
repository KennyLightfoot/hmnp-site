/**
 * RON Session Status API
 * 
 * Get the status of a BlueNotary RON session.
 */
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { blueNotaryClient } from '@/lib/ron/bluenotary';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    // Check if BlueNotary integration is available
    if (!blueNotaryClient.isEnabled()) {
      return NextResponse.json(
        { error: 'RON service is not available' },
        { status: 503 }
      );
    }
    
    // Get session details
    const session = await blueNotaryClient.getSession(sessionId);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // Return session details
    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        sessionUrl: session.sessionUrl,
        notaryName: session.notaryName,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        documentIds: session.documentIds,
      },
    });
  } catch (error) {
    logger.error('Error getting RON session status', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}