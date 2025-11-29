import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/db";
import { runAgentsJob } from "@/lib/agents-client";
import { authOptions } from "@/lib/auth";
import { withAdminSecurity } from "@/lib/security/comprehensive-security";
import { getErrorMessage } from "@/lib/utils/error-utils";

export const dynamic = "force-dynamic";

export const GET = withAdminSecurity(async () => {
  // Cast prisma to any to work around typegen lag for the new ContentJob model
  const jobs = await (prisma as any).contentJob.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    success: true,
    jobs,
  });
});

export const POST = withAdminSecurity(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const session = await getServerSession(authOptions);
    const { instructions, contentType, targetCity, serviceType, tonePreset, title } = body;

    if (!instructions || !contentType) {
      return NextResponse.json({ error: "Missing instructions or content type" }, { status: 400 });
    }

    const job = await (prisma as any).contentJob.create({
      data: {
        type: contentType,
        title,
        instructions,
        targetCity,
        serviceType,
        tonePreset,
        createdById: (session?.user as any)?.id ?? null,
        status: "NEW",
      },
    });

    const agentResponse = await runAgentsJob({
      text: instructions,
      contentType,
      metadata: {
        targetCity,
        serviceType,
        tonePreset,
        contentJobId: job.id,
      },
      enqueue: true,
    });

    await (prisma as any).contentJob.update({
      where: { id: job.id },
      data: {
        agentJobId: agentResponse.jobId ?? agentResponse.correlationId,
        status: agentResponse.ok ? "PENDING_REVIEW" : "REJECTED",
      },
    });

    return NextResponse.json({
      success: true,
      jobId: job.id,
      agentJob: agentResponse,
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

