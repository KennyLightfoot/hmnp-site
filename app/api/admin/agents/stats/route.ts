import { NextResponse } from 'next/server';

import { withAdminSecurity } from '@/lib/security/comprehensive-security';
import { fetchAgentsStats } from '@/lib/agents-client';
import { getErrorMessage } from '@/lib/utils/error-utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withAdminSecurity(async () => {
  try {
    const stats = await fetchAgentsStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: getErrorMessage(error) },
      { status: 500 },
    );
  }
});

