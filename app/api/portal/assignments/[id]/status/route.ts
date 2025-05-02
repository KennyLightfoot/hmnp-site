import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"
import { AssignmentStatus } from "@prisma/client"

interface Body {
  status?: AssignmentStatus
  note?: string
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { status, note } = (await req.json()) as Body
  if (!status && !note) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 })
  }

  // Ensure the assignment belongs to the partner
  const assignment = await prisma.assignment.findFirst({
    where: { id: params.id, partnerAssignedToId: session.user.id },
  })
  if (!assignment) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Update main status if provided
  if (status && status !== assignment.status) {
    await prisma.assignment.update({
      where: { id: params.id },
      data: { status },
    })
  }

  // Add history record if status or note provided
  await prisma.statusHistory.create({
    data: {
      assignmentId: params.id,
      status: status || assignment.status,
      note,
      changedById: session.user.id,
    },
  })

  return NextResponse.json({ ok: true })
}
