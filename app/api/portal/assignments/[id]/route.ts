import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = params.id;
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const assignment = await prisma.assignment.findFirst({
      where: { id: id, partnerAssignedToId: session.user.id },
      include: {
        AssignmentDocument: {
          select: { id: true, filename: true, uploadedAt: true },
          orderBy: { uploadedAt: "desc" },
        },
        StatusHistory: { orderBy: { changedAt: "desc" } },
      },
    })

    if (!assignment) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json(assignment)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
