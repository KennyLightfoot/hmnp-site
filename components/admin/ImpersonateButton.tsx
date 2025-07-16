'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface Props {
  userId: string
  userEmail?: string | null
}

export default function ImpersonateButton({ userId, userEmail }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleImpersonate = async () => {
    if (!confirm(`Impersonate ${userEmail || userId}?`)) return

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}/impersonate`, {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      toast({ title: 'Impersonation active', description: `Now browsing as ${userEmail || userId}` })
      router.push('/portal')
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleImpersonate} disabled={loading}>
      {loading ? 'Impersonating...' : 'Impersonate'}
    </Button>
  )
} 