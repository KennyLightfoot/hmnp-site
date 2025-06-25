'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function EnhancedWizardRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to main booking page
    router.replace('/booking')
  }, [router])
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
        <p className="text-gray-600">Taking you to our enhanced booking experience</p>
      </div>
    </div>
  )
} 