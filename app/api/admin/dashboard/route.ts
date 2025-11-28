import { NextResponse } from "next/server";

import { withAdminSecurity } from "@/lib/security/comprehensive-security";
import { getDashboardOverviewData } from "@/lib/services/admin-metrics";
import { getErrorMessage } from "@/lib/utils/error-utils";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export const GET = withAdminSecurity(async () => {
  try {
    const data = await getDashboardOverviewData();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error("Admin dashboard API error", "ADMIN_DASHBOARD", error as Error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard data",
        message: error instanceof Error ? getErrorMessage(error) : "Unknown error",
      },
      { status: 500 },
    );
  }
});
