import { NextResponse } from "next/server";

import { withAdminSecurity } from "@/lib/security/comprehensive-security";
import { getNetworkDashboardData } from "@/lib/services/admin-metrics";
import { getErrorMessage } from "@/lib/utils/error-utils";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export const GET = withAdminSecurity(async () => {
  try {
    const data = await getNetworkDashboardData();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error("Network dashboard API error", "NETWORK_DASHBOARD", error as Error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch network dashboard data",
        message: error instanceof Error ? getErrorMessage(error) : "Unknown error",
      },
      { status: 500 },
    );
  }
});
