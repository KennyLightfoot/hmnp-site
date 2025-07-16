'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface Props {
  userId: string
  userEmail?: string | null
}

export default function ResetTwoFactorButton({ userId, userEmail }: Props) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleReset = async () => {
    if (!confirm(`Reset 2FA for ${userEmail || userId}?`)) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}/two-factor/reset`, {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      toast({ title: '2FA reset', description: `Two-factor authentication disabled for ${userEmail || userId}.` })
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleReset} disabled={loading}>
      {loading ? 'Resetting...' : 'Reset 2FA'}
    </Button>
  )
} 