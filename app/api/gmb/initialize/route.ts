import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { gmbManager } from '@/lib/gmb/manager';
import { withRateLimit } from '@/lib/security/rate-limiting';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withRateLimit('admin', 'gmb_initialize')(async (request: NextRequest) => {
  try {
    // Check if GMB is enabled
    const gmbEnabled = process.env.GMB_POSTING_ENABLED === 'true';
    
    if (!gmbEnabled) {
      return NextResponse.json(
        { error: 'GMB posting is not enabled' },
        { status: 400 }
      );
    }

    // Check API key authentication
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.INTERNAL_API_KEY;
    
    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.slice(7) !== apiKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🚀 Starting GMB initialization...');
    
    // Initialize GMB Manager
    await gmbManager.initialize();
    
    // Get task statistics after initialization
    const taskStats = gmbManager.getTaskStats();
    
    console.log('✅ GMB initialization completed successfully');
    console.log(`📊 Task Stats: ${JSON.stringify(taskStats)}`);
    
    return NextResponse.json({
      success: true,
      message: 'GMB system initialized successfully',
      stats: taskStats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error initializing GMB:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to initialize GMB system',
        details: error instanceof Error ? getErrorMessage(error) : 'Unknown error'
      },
      { status: 500 }
    );
  }
})

// Health check endpoint
export const GET = withRateLimit('admin', 'gmb_initialize_health')(async (request: NextRequest) => {
  try {
    const gmbEnabled = process.env.GMB_POSTING_ENABLED === 'true';
    
    if (!gmbEnabled) {
      return NextResponse.json({
        status: 'disabled',
        message: 'GMB posting is not enabled',
        timestamp: new Date().toISOString(),
      });
    }

    // Check GMB credentials
    const requiredCredentials = [
      'GOOGLE_MY_BUSINESS_CLIENT_ID',
      'GOOGLE_MY_BUSINESS_CLIENT_SECRET',
      'GOOGLE_MY_BUSINESS_REFRESH_TOKEN',
      'GOOGLE_MY_BUSINESS_LOCATION_ID',
      'GOOGLE_MY_BUSINESS_ACCOUNT_ID',
    ];

    const missingCredentials = requiredCredentials.filter(
      cred => !process.env[cred]
    );

    if (missingCredentials.length > 0) {
      return NextResponse.json({
        status: 'error',
        message: 'Missing required GMB credentials',
        missingCredentials,
        timestamp: new Date().toISOString(),
      });
    }

    // Get current task statistics
    const taskStats = gmbManager.getTaskStats();
    
    return NextResponse.json({
      status: 'ready',
      message: 'GMB system is ready for initialization',
      taskStats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error checking GMB status:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Failed to check GMB status',
      error: error instanceof Error ? getErrorMessage(error) : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
})
