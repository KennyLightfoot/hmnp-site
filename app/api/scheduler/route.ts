/**
 * Notification Scheduler API Route
 * 
 * This endpoint manages the notification scheduler and allows manual triggering
 * of notification checks. It's designed to be called by an external service
 * (like cron-job.org) to ensure the scheduler is always running.
 * 
 * Routes:
 * - GET /api/scheduler - Get scheduler status
 * - POST /api/scheduler/init - Initialize the scheduler
 * - POST /api/scheduler/check - Run an immediate notification check 
 */

import { NextRequest, NextResponse } from 'next/server';
import { initializeSchedulers, getSchedulersStatus } from '@/lib/schedulers';
import { runImmediateNotificationCheck } from '@/lib/schedulers/notificationScheduler';
import { logger } from '@/lib/logger';

// Track if the scheduler has been initialized in this instance
let schedulerInitializedInInstance = false;

// Environment-specific initialization tracking
// This helps prevent multiple initializations in development mode with hot reloading
const isProduction = process.env.NODE_ENV === 'production';
const CRON_SECRET = process.env.CRON_SECRET || 'default-development-secret';

/**
 * Authentication middleware
 */
function authenticateRequest(request: NextRequest): boolean {
  // In production, require a valid secret token for security
  if (isProduction) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.split(' ')[1];
    return token === CRON_SECRET;
  }
  
  // In development, always allow
  return true;
}

/**
 * GET handler - Returns scheduler status
 */
export async function GET(request: NextRequest) {
  if (!authenticateRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const status = getSchedulersStatus();
    return NextResponse.json({ 
      status,
      initializedInInstance: schedulerInitializedInInstance,
      environment: process.env.NODE_ENV
    });
  } catch (error: any) {
    logger.error('Error getting scheduler status:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST handler - Manages scheduler operations based on path
 */
export async function POST(request: NextRequest) {
  if (!authenticateRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get the specific operation from the URL path
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const operation = pathSegments[pathSegments.length - 1];

    switch (operation) {
      case 'init':
        // Initialize the schedulers if not already done
        if (!schedulerInitializedInInstance) {
          initializeSchedulers();
          schedulerInitializedInInstance = true;
          logger.info('Schedulers initialized via API route');
          return NextResponse.json({ success: true, message: 'Schedulers initialized' });
        }
        return NextResponse.json({ success: true, message: 'Schedulers already initialized' });

      case 'check':
        // Run an immediate notification check
        await runImmediateNotificationCheck();
        return NextResponse.json({ success: true, message: 'Notification check triggered' });
        
      default:
        return NextResponse.json({ error: 'Unknown operation' }, { status: 400 });
    }
  } catch (error: any) {
    logger.error('Error in scheduler API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
