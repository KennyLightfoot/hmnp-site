import { NextResponse } from "next/server";

import { withAdminSecurity } from "@/lib/security/comprehensive-security";
import { getContentStats } from "@/lib/services/admin-metrics";
import { getErrorMessage } from "@/lib/utils/error-utils";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export const GET = withAdminSecurity(async () => {
  try {
    const data = await getContentStats();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error("Admin content stats API error", "ADMIN_CONTENT", error as Error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch content stats",
        message: error instanceof Error ? getErrorMessage(error) : "Unknown error",
      },
      { status: 500 },
    );
  }
});

