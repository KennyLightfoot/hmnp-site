import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3'

async function main() {
  const bucket = process.env.S3_BUCKET
  if (!bucket) throw new Error('S3_BUCKET not set')
  const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' })
  const cutoffDays = parseInt(process.env.PREBOOKING_RETENTION_DAYS || '30', 10)
  const cutoff = Date.now() - cutoffDays * 24 * 60 * 60 * 1000
  const prefix = 'prebooking-uploads/'

  let ContinuationToken: string | undefined
  let deleted = 0
  do {
    const res = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken }))
    ContinuationToken = res.IsTruncated ? res.NextContinuationToken : undefined
    for (const obj of res.Contents || []) {
      if (!obj.Key || !obj.LastModified) continue
      if (obj.LastModified.getTime() < cutoff) {
        await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: obj.Key }))
        deleted++
        console.log('Deleted', obj.Key)
      }
    }
  } while (ContinuationToken)
  console.log(`Cleanup complete. Deleted ${deleted} objects older than ${cutoffDays} days.`)
}

main().catch((e) => { console.error(e); process.exit(1) })


