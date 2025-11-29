import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { withAdminSecurity } from "@/lib/security/comprehensive-security";
import { getErrorMessage } from "@/lib/utils/error-utils";

export const PATCH = withAdminSecurity(async (request: NextRequest, { params }) => {
  try {
    const body = await request.json();
    const { status, approvedContent, views, leadsCaptured } = body as {
      status?: string;
      approvedContent?: unknown;
      views?: number;
      leadsCaptured?: number;
    };

    if (!status && typeof views !== "number" && typeof leadsCaptured !== "number" && !approvedContent) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    const data: any = {};
    if (status) {
      data.status = status;
      data.publishedAt = status === "PUBLISHED" ? new Date() : undefined;
    }
    if (approvedContent !== undefined) {
      data.approvedContent = approvedContent;
    }
    if (typeof views === "number") {
      data.views = views;
    }
    if (typeof leadsCaptured === "number") {
      data.leadsCaptured = leadsCaptured;
    }

    // NOTE: Some tooling/typegen paths may not yet be aware of the new ContentJob
    // model on PrismaClient; we cast to any here to avoid blocking builds while
    // still using the generated delegate at runtime.
    const job = await (prisma as any).contentJob.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({
      success: true,
      job,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: getErrorMessage(error),
      },
      { status: 500 },
    );
  }
});

