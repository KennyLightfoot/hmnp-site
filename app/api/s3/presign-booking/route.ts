import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg']
const MAX_BYTES = 25 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    const { customerEmail, filename, contentType, fileSize, serviceType } = await request.json()
    if (!customerEmail || !filename || !contentType || !fileSize) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    if (fileSize > MAX_BYTES) {
      return NextResponse.json({ error: 'File too large' }, { status: 413 })
    }
    if (!ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 })
    }

    const bucket = process.env.S3_BUCKET as string
    if (!bucket) return NextResponse.json({ error: 'S3 not configured' }, { status: 500 })

    const safeName = String(filename).replace(/[^a-zA-Z0-9._-]/g, '_')
    const emailHash = Buffer.from(customerEmail.toLowerCase()).toString('hex').slice(0, 24)
    const pathPrefix = 'prebooking-uploads'
    const key = `${pathPrefix}/${serviceType || 'standard'}/${emailHash}/${Date.now()}-${safeName}`
    const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' })
    const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType })
    const url = await getSignedUrl(s3, command, { expiresIn: 60 * 5 })
    return NextResponse.json({ url, key })
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to create presigned URL' }, { status: 500 })
  }
}


