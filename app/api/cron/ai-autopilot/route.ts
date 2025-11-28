import { NextResponse } from "next/server";

import { runAutopilot } from "@/lib/autopilot/engine";
import { withAdminSecurity } from "@/lib/security/comprehensive-security";
import { getErrorMessage } from "@/lib/utils/error-utils";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export const POST = withAdminSecurity(async () => {
  try {
    const result = await runAutopilot();
    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    logger.error("AI autopilot run failed", "AUTOPILOT", error as Error);
    return NextResponse.json(
      {
        success: false,
        error: getErrorMessage(error),
      },
      { status: 500 },
    );
  }
});

