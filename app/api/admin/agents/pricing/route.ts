import { NextRequest, NextResponse } from 'next/server';

import { withAdminSecurity } from '@/lib/security/comprehensive-security';
import { fetchAgentsPricing } from '@/lib/agents-client';
import { getErrorMessage } from '@/lib/utils/error-utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withAdminSecurity(async (request: NextRequest) => {
  try {
    const params = request.nextUrl.searchParams;
    const limitParam = params.get('limit');
    const needsReviewParam = params.get('needsReview');
    const dateFrom = params.get('dateFrom') ?? undefined;

    const pricing = await fetchAgentsPricing({
      limit: limitParam ? Number(limitParam) : undefined,
      needsReview:
        needsReviewParam != null ? needsReviewParam === 'true' : undefined,
      dateFrom,
    });

    return NextResponse.json(pricing);
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: getErrorMessage(error) },
      { status: 500 },
    );
  }
});

