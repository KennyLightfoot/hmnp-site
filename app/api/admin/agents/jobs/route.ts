import { NextRequest, NextResponse } from 'next/server';

import { withAdminSecurity } from '@/lib/security/comprehensive-security';
import { fetchAgentsJobs } from '@/lib/agents-client';
import { getErrorMessage } from '@/lib/utils/error-utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withAdminSecurity(async (request: NextRequest) => {
  try {
    const params = request.nextUrl.searchParams;
    const limitParam = params.get('limit');
    const status = params.get('status') ?? undefined;
    const dateFrom = params.get('dateFrom') ?? undefined;
    const dateTo = params.get('dateTo') ?? undefined;

    const jobs = await fetchAgentsJobs({
      limit: limitParam ? Number(limitParam) : undefined,
      status,
      dateFrom,
      dateTo,
    });

    return NextResponse.json(jobs);
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: getErrorMessage(error) },
      { status: 500 },
    );
  }
});

