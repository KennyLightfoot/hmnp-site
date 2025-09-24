"use client"

import { useState } from "react"

const MAX_MB = 25
const MAX_BYTES = MAX_MB * 1024 * 1024

interface Props {
  assignmentId: string
  onUploaded: () => void
}

export default function FileUploader({ assignmentId, onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  async function handleUpload() {
    if (!file) return
    if (file.size > MAX_BYTES) {
      setError(`File exceeds ${MAX_MB} MB limit`)
      return
    }
    setError(null)

    // 1. get presigned URL
    const presignRes = await fetch("/api/s3/presign", {
      method: "POST",
      body: JSON.stringify({ assignmentId, filename: file.name, contentType: file.type, fileSize: file.size }),
    })
    if (!presignRes.ok) {
      setError("Failed to get upload URL")
      return
    }
    const { url, key } = await presignRes.json()

    // 2. upload direct to S3
    await fetch(url, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    })

    // 3. notify backend
    await fetch(`/api/portal/assignments/${assignmentId}/docs`, {
      method: "POST",
      body: JSON.stringify({ key, filename: file.name }),
    })

    setFile(null)
    onUploaded()
  }

  return (
    <div>
      <input
        type="file"
        onChange={(e) => {
          const f = e.target.files?.[0] || null
          if (f && f.size > MAX_BYTES) {
            setError(`File exceeds ${MAX_MB} MB limit`)
            setFile(null)
          } else {
            setError(null)
            setFile(f)
          }
        }}
      />
      <button
        disabled={!file}
        onClick={handleUpload}
        className="ml-2 px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        Upload
      </button>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}
