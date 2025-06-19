/**
 * Cron Job Testing API
 * 
 * This route is used to test that Vercel cron jobs are working properly.
 * It simply logs the request and returns basic information about when it was triggered.
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  // Check if the request is coming from Vercel's cron system
  const authHeader = request.headers.get('authorization');
  const isCronRequest = authHeader && authHeader.startsWith('Bearer ');
  
  const triggerTime = new Date().toISOString();
  
  logger.info(`Cron test endpoint triggered at ${triggerTime}`, {
    isCronRequest,
    headers: Object.fromEntries(request.headers.entries())
  });
  
  // Log in console too for development testing
  console.log(`Cron test triggered at ${triggerTime}`);
  
  return NextResponse.json({
    success: true,
    message: 'Cron test executed',
    timestamp: triggerTime,
    isCronRequest
  });
}
