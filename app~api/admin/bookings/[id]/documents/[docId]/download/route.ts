import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Role } from '@prisma/client'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string, docId: string }> }) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role as Role | undefined
  if (!session?.user || (role !== Role.ADMIN && role !== Role.STAFF)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id, docId } = await params
  const doc = await prisma.bookingUploadedDocument.findFirst({ where: { id: docId, bookingId: id } })
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const bucket = process.env.S3_BUCKET as string
  const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' })
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: doc.s3Key })
  const url = await getSignedUrl(s3, cmd, { expiresIn: 60 })
  return NextResponse.redirect(url)
}


