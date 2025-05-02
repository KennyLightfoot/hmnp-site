import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const assignment = await prisma.assignment.findFirst({
    where: { id: params.id, partnerAssignedToId: session.user.id },
    include: {
      documents: {
        select: { id: true, filename: true, uploadedAt: true },
        orderBy: { uploadedAt: "desc" },
      },
      history: { orderBy: { changedAt: "desc" } },
    },
  })

  if (!assignment) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json(assignment)
}
