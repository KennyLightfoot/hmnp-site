import { NextRequest, NextResponse } from "next/server";

import { withAdminSecurity } from "@/lib/security/comprehensive-security";
import { getNetworkJobsData, type NetworkJobFilter } from "@/lib/services/admin-metrics";
import { getErrorMessage } from "@/lib/utils/error-utils";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function resolveFilter(value: string | null): NetworkJobFilter {
  if (value === "pending" || value === "assigned" || value === "expired") {
    return value;
  }
  return "needs-action";
}

export const GET = withAdminSecurity(async (request: NextRequest) => {
  try {
    const filter = resolveFilter(request.nextUrl.searchParams.get("filter"));
    const data = await getNetworkJobsData(filter);
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error("Network jobs API error", "NETWORK_JOBS", error as Error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch network jobs",
        message: error instanceof Error ? getErrorMessage(error) : "Unknown error",
      },
      { status: 500 },
    );
  }
});

