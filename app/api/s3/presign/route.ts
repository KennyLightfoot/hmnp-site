import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3 } from '@/lib/s3'
import { withRateLimit } from '@/lib/security/rate-limiting'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_BYTES = 25 * 1024 * 1024

const BodySchema = z.object({
  assignmentId: z.string().min(1),
  filename: z.string().min(1),
  contentType: z.string().optional(),
  fileSize: z.number().int().positive().max(MAX_BYTES).optional(),
});

export const POST = withRateLimit('api_general', 's3_presign')(async (req: NextRequest) => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = BodySchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
  const { assignmentId, filename, contentType, fileSize } = parsed.data
  if (!assignmentId || !filename) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
  if (fileSize && fileSize > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large' }, { status: 400 })
  }

  // Verify the assignment belongs to this user (partner)
  const exists = await prisma.assignment.count({
    where: { id: assignmentId, partnerAssignedToId: session.user.id },
  })
  if (!exists) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const safeName = String(filename).replace(/[^a-zA-Z0-9._-]/g, '_')
  const key = `assignments/${assignmentId}/${Date.now()}_${safeName}`

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    ContentType: contentType || 'application/octet-stream',
    ServerSideEncryption: 'AES256',
  })
  const url = await getSignedUrl(s3, command, { expiresIn: 300 })
  return NextResponse.json({ url, key })
})
