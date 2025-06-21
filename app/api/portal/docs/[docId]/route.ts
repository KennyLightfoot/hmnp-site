import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import type { Session } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { s3 } from "@/lib/s3"

// Secure download redirect for partners. Expires in 2 minutes.
export async function GET(req: NextRequest, context: { params: Promise<{ docId: string }> }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string })?.id
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const params = await context.params;
  
  const doc = await prisma.assignmentDocument.findUnique({
    where: { id: params.docId },
    include: { assignment: { select: { partnerAssignedToId: true } } },
  })
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (doc.assignment.partnerAssignedToId !== userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const cmd = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: doc.key,
    ResponseContentDisposition: `attachment; filename=\\"${encodeURIComponent(doc.filename)}\\"`,
  })
  const url = await getSignedUrl(s3, cmd, { expiresIn: 120 })

  // Audit
  try {
    await prisma.downloadLog.create({
      data: {
        documentId: doc.id,
        userId,
      },
    })
  } catch (e) {
    console.error("Failed to write DownloadLog", e)
  }

  return NextResponse.redirect(url, 302)
}
