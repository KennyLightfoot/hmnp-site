import { NextRequest, NextResponse } from "next/server"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { s3 } from "@/lib/s3"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

const MAX_BYTES = 25 * 1024 * 1024

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { assignmentId, filename, contentType, fileSize } = await req.json()
  if (!assignmentId || !filename) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 })
  }
  if (fileSize && fileSize > MAX_BYTES) {
    return NextResponse.json({ error: "File too large" }, { status: 400 })
  }
  const exists = await prisma.assignment.count({ where: { id: assignmentId, partnerAssignedToId: session.user.id } })
  if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const key = `assignments/${assignmentId}/${Date.now()}_${filename}`
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    ContentType: contentType || "application/octet-stream",
    ServerSideEncryption: "AES256",
  })
  const url = await getSignedUrl(s3, command, { expiresIn: 300 })
  return NextResponse.json({ url, key })
}
