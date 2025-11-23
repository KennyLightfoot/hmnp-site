import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { prisma } from '@/lib/db';
import { bookingSchemas } from '@/lib/validation/schemas';
import { ServiceType } from '@/lib/prisma-types';
import { z } from 'zod';
import { createBookingFromForm } from '@/lib/booking/create';
import { withRateLimit } from '@/lib/security/rate-limiting';
import { withBookingSecurity } from '@/lib/security/comprehensive-security';
import redis from '@/lib/redis';
import { logger } from '@/lib/logger';
import { appendAuditLog } from '@/lib/audit-log';

export const BookingSchema = bookingSchemas.createBookingFromForm;
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const IDEMPOTENCY_CACHE_PREFIX = 'booking:idempotency:';
const IDEMPOTENCY_CACHE_TTL_SECONDS = 60 * 30; // 30 minutes
const IDEMPOTENCY_LOCK_TTL_SECONDS = 60 * 5; // 5 minutes

export const POST = withBookingSecurity(async (request: NextRequest) => {
  const idempotencyKeyHeader = request.headers.get('Idempotency-Key')?.trim() || '';
  const allowIdempotency = idempotencyKeyHeader.length > 0 && (process.env.ENABLE_BOOKING_IDEMPOTENCY ?? 'true') !== 'false';

  let cacheKey: string | null = allowIdempotency ? `${IDEMPOTENCY_CACHE_PREFIX}${idempotencyKeyHeader}` : null;
  let lockKey: string | null = cacheKey ? `${cacheKey}:lock` : null;
  let redisReady = false;
  let releaseLock: (() => Promise<void>) | null = null;

  try {
    if (allowIdempotency && cacheKey && lockKey) {
      try {
        await redis.ping();
        redisReady = true;

        const cachedRaw = await redis.get(cacheKey);
        if (cachedRaw) {
          try {
            const cached = JSON.parse(cachedRaw);
            if (cached?.statusCode && cached?.body) {
              return NextResponse.json(cached.body, { status: cached.statusCode });
            }
          } catch (error) {
            logger.warn('Failed to parse cached idempotent booking payload', error as Error, { cacheKey });
          }
        }

        const lockCount = await redis.incr(lockKey);
        if (lockCount === 1) {
          await redis.expire(lockKey, IDEMPOTENCY_LOCK_TTL_SECONDS);
          releaseLock = async () => {
            await redis.del(lockKey!);
          };
        } else {
          await redis.expire(lockKey, IDEMPOTENCY_LOCK_TTL_SECONDS);
          return NextResponse.json({
            success: false,
            error: 'Duplicate booking submission detected. Please wait for the current request to finish.',
          }, { status: 409 });
        }
      } catch (error) {
        redisReady = false;
        releaseLock = null;
        logger.warn('Idempotency safeguards unavailable, continuing without cache', error as Error, { idempotencyKey: idempotencyKeyHeader });
      }
    }

    // Handle both JSON and form submissions
    const contentType = request.headers.get('content-type') || ''
    let body: any
    if (contentType.includes('application/json')) {
      body = await request.json()
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const form = await request.formData()
      body = Object.fromEntries(form as any)
    } else {
      body = await request.json().catch(() => ({}))
    }
    const validatedData = bookingSchemas.createBookingFromForm.parse(body);
    // Preserve attribution for CRM enrichment
    const utmParameters = (body as any)?.utmParameters || undefined
    const referrer = (body as any)?.referrer || undefined

    const { booking, service } = await createBookingFromForm({ validatedData, rawBody: { ...body, utmParameters, referrer } });
    const bookingId = (booking as any)?.id;
    const scheduled = (booking as any)?.scheduledDateTime;
    const totalAmount = (booking as any)?.priceAtBooking;

    const responsePayload = {
      success: true,
      booking: {
        id: bookingId,
        confirmationNumber: bookingId,
        scheduledDateTime: scheduled,
        totalAmount,
        service: {
          name: service.name as any,
          serviceType: service.serviceType as any,
        },
      },
    };

    try {
      await appendAuditLog({
        bookingId,
        entity: 'booking',
        action: 'BOOKING_CREATED',
        performedBy: undefined,
        data: { service: responsePayload.booking.service, scheduledDateTime: scheduled, totalAmount }
      })
    } catch (e) {
      logger.warn('Failed to append booking audit log', e as Error, { bookingId })
    }

    if (redisReady && cacheKey) {
      try {
        await redis.set(cacheKey, JSON.stringify({ statusCode: 200, body: responsePayload }), IDEMPOTENCY_CACHE_TTL_SECONDS);
      } catch (error) {
        logger.warn('Failed to persist idempotent booking response', error as Error, { cacheKey });
      }
    }

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error('Error in POST /api/booking/create:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json({ message: 'Validation failed', errors: error.errors }, { status: 400 });
    }
    const status = (error as any)?.status || 500
    if (status === 409) {
      return NextResponse.json({
        error: 'TIME_UNAVAILABLE',
        message: error?.message || 'Selected time is no longer available. Please pick a different time.',
        code: 'TIME_CONFLICT',
      }, { status })
    }
    return NextResponse.json({ message: 'Internal Server Error', error: getErrorMessage(error) }, { status });
  } finally {
    if (releaseLock) {
      try {
        await releaseLock();
      } catch (error) {
        logger.warn('Failed to release booking idempotency lock', error as Error, { cacheKey });
      }
    }
  }
}, process.env.NODE_ENV !== 'production' ? { csrf: { enabled: false } } : undefined);

// CORS preflight to support deploy previews and prevent null-origin 403s when CSRF is valid
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_BASE_URL || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-csrf-token',
      'Access-Control-Max-Age': '86400',
    },
  });
}
