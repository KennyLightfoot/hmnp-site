import { NextRequest, NextResponse } from 'next/server';

import { withAdminSecurity } from '@/lib/security/comprehensive-security';
import { fetchAgentsLeads } from '@/lib/agents-client';
import { getErrorMessage } from '@/lib/utils/error-utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withAdminSecurity(async (request: NextRequest) => {
  try {
    const params = request.nextUrl.searchParams;
    const limitParam = params.get('limit');
    const status = params.get('status') ?? undefined;
    const source = params.get('source') ?? undefined;
    const dateFrom = params.get('dateFrom') ?? undefined;

    const leads = await fetchAgentsLeads({
      limit: limitParam ? Number(limitParam) : undefined,
      status,
      source,
      dateFrom,
    });

    return NextResponse.json(leads);
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: getErrorMessage(error) },
      { status: 500 },
    );
  }
});

