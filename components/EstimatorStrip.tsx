"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { track } from '@/app/lib/analytics'

type EstimateResponse = {
  ok: boolean
  mode: 'MOBILE' | 'RON'
  miles?: number
  total?: number
}

export default function EstimatorStrip({ defaultMode = 'MOBILE' as 'MOBILE' | 'RON' }) {
  const [zip, setZip] = useState('')
  const [acts, setActs] = useState(1)
  const [mode, setMode] = useState<'MOBILE' | 'RON'>(defaultMode)
  const [isLoading, setIsLoading] = useState(false)
  const [estimate, setEstimate] = useState<EstimateResponse | null>(null)

  async function getEstimate() {
    setIsLoading(true)
    setEstimate(null)
    try {
      const res = await fetch('/api/estimate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode, zip, acts }) })
      const data: EstimateResponse = await res.json()
      if (data.ok) {
        setEstimate(data)
        track('estimate_shown', { mode: data.mode, amount: data.total ?? 0, acts })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-secondary/5 border border-secondary/10 rounded-xl p-4">
      <div className="flex flex-wrap gap-2 items-center">
        <button className={`px-3 py-2 rounded-full text-sm ${mode === 'MOBILE' ? 'bg-secondary text-white' : 'bg-white'}`} onClick={() => { setMode('MOBILE'); track('mode_toggled', { mode: 'MOBILE', location: 'estimator_strip' }) }}>Mobile</button>
        <button className={`px-3 py-2 rounded-full text-sm ${mode === 'RON' ? 'bg-secondary text-white' : 'bg-white'}`} onClick={() => { setMode('RON'); track('mode_toggled', { mode: 'RON', location: 'estimator_strip' }) }}>Online (RON)</button>
        <input className="px-3 py-2 rounded-lg border bg-white" placeholder="ZIP" value={zip} onChange={(e) => setZip(e.target.value.replace(/[^0-9]/g, '').slice(0,5))} maxLength={5} />
        <input className="px-3 py-2 rounded-lg border bg-white" placeholder="# acts" value={acts} onChange={(e) => setActs(Math.max(1, parseInt(e.target.value || '1', 10)))} />
        <Button className="bg-primary text-white" onClick={getEstimate}>{isLoading ? '...' : 'Estimate'}</Button>
        {estimate?.ok && (
          <div className="ml-auto text-secondary">Est. ${estimate.total}{estimate.miles != null ? ` (~${estimate.miles} mi)` : ''}</div>
        )}
      </div>
    </div>
  )
}


