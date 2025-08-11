"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface Props {
  bookingId: string
  docId: string
  filename: string
}

export default function DeleteUploadedDocButton({ bookingId, docId, filename }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const onDelete = async () => {
    if (isDeleting) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/documents/${docId}`, {
        method: 'DELETE'
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || `Delete failed (${res.status})`)
      }
      toast({ title: 'Document deleted', description: `Removed "${filename}"` })
      router.refresh()
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Delete failed'
      toast({ title: 'Delete failed', description: message, variant: 'destructive' as any })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button size="sm" variant="destructive" onClick={onDelete} disabled={isDeleting}>
      {isDeleting ? 'Deleting…' : 'Delete'}
    </Button>
  )
}


