import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Role } from '@/lib/prisma-types'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string, docId: string }> }) {
  // method override to support simple form post with _method=DELETE
  const bodyText = await request.text().catch(()=>'')
  const params = new URLSearchParams(bodyText)
  const method = params.get('_method')
  if (method?.toUpperCase() === 'DELETE') {
    return DELETE(request, ctx)
  }
  return NextResponse.json({ error: 'Unsupported' }, { status: 405 })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string, docId: string }> }) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role as Role | undefined
  if (!session?.user || (role !== Role.ADMIN && role !== Role.STAFF)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id, docId } = await params
  const doc = await prisma.bookingUploadedDocument.findFirst({ where: { id: docId, bookingId: id } })
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // delete from S3
  try {
    const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' })
    await s3.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET as string, Key: doc.s3Key }))
  } catch (e) {
    // best-effort; continue to delete DB record
  }

  await prisma.bookingUploadedDocument.delete({ where: { id: doc.id } })
  return NextResponse.json({ success: true })
}


