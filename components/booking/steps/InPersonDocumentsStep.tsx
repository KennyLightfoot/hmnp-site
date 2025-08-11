"use client";
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'

interface Props {
  data: any
  onUpdate: (updates: any) => void
  errors?: any
}

const MAX_MB = 25
const MAX_BYTES = MAX_MB * 1024 * 1024
const ALLOWED = ['application/pdf','image/png','image/jpeg']

export default function InPersonDocumentsStep({ data, onUpdate }: Props) {
  const [file, setFile] = useState<File|null>(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string|null>(null)
  const [uploaded, setUploaded] = useState<{key:string,name:string}[]>(data?.uploadedDocs || [])

  const customerEmail = data?.customer?.email || ''
  const serviceType = data?.serviceType || 'STANDARD_NOTARY'

  async function handleUpload() {
    if (!file) return
    if (file.size > MAX_BYTES) return setError(`Max ${MAX_MB}MB`)
    if (!ALLOWED.includes(file.type)) return setError('Use PDF/PNG/JPEG')
    setError(null)
    setProgress(5)

    const presign = await fetch('/api/s3/presign-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerEmail, filename: file.name, contentType: file.type, fileSize: file.size, serviceType })
    })
    if (!presign.ok) return setError('Failed to prepare upload')
    const { url, key } = await presign.json()
    setProgress(15)

    await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
    setProgress(90)
    const next = [...uploaded, { key, name: file.name }]
    setUploaded(next)
    onUpdate({ uploadedDocs: next })
    setFile(null)
    setProgress(100)
    setTimeout(()=>setProgress(0), 600)
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Optional: upload documents now to help your notary prepare. Max {MAX_MB}MB, PDF/PNG/JPEG.</p>
      <Input type="file" onChange={(e)=>{
        const f = e.target.files?.[0]||null
        if (f && f.size>MAX_BYTES) { setError(`Max ${MAX_MB}MB`); setFile(null) } else { setError(null); setFile(f) }
      }} />
      <div className="flex items-center gap-2">
        <Button size="sm" disabled={!file} onClick={handleUpload}>Upload</Button>
        {progress>0 && <Progress value={progress} className="w-40" />}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {uploaded.length>0 && (
        <div>
          <p className="text-sm font-medium mb-1">Uploaded</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground">
            {uploaded.map(u=> (<li key={u.key}>{u.name}</li>))}
          </ul>
        </div>
      )}
    </div>
  )
}


