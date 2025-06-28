import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { key, filename } = await req.json()
  if (!key || !filename) return NextResponse.json({ error: "Bad request" }, { status: 400 })

  const params = await context.params;
  
  // ownership check
  const assignment = await prisma.Assignment.findFirst({
    where: { id: params.id, partnerAssignedToId: session.user.id },
  })
  if (!assignment) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.AssignmentDocument.create({
    data: {
      assignmentId: params.id,
      key,
      filename,
      uploadedById: session.user.id,
    },
  })
  return NextResponse.json({ ok: true })
}
