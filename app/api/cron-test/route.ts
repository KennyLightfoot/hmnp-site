/**
 * Cron Job Testing API
 * 
 * This route is used to test that Vercel cron jobs are working properly.
 * It simply logs the request and returns basic information about when it was triggered.
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : null;

  const isCronRequest = Boolean(token && CRON_SECRET && token === CRON_SECRET);
  const triggerTime = new Date().toISOString();

  logger.info(`Cron test endpoint triggered at ${triggerTime}`, 'CRON_TEST', {
    isCronRequest,
    headers: Object.fromEntries(request.headers.entries()),
  });

  // In production, require a valid CRON_SECRET token
  if (process.env.NODE_ENV === 'production' && !isCronRequest) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized cron invocation' },
      { status: 401 },
    );
  }

  // Log in console too for development testing
  console.log(`Cron test triggered at ${triggerTime}`);

  return NextResponse.json({
    success: true,
    message: 'Cron test executed',
    timestamp: triggerTime,
    isCronRequest,
  });
}
