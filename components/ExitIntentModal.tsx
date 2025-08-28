"use client"

import { useEffect, useRef, useState } from 'react'

export default function ExitIntentModal() {
  const [open, setOpen] = useState(false)
  const shownRef = useRef(false)

  useEffect(() => {
    const isEligiblePath = () => {
      if (typeof window === 'undefined') return false
      const p = window.location.pathname
      return p.startsWith('/booking') || p.startsWith('/lp') || p.startsWith('/services/mobile-notary')
    }

    const onMouseLeave = (e: MouseEvent) => {
      if (!isEligiblePath()) return
      if (shownRef.current) return
      if (e.clientY <= 0) {
        shownRef.current = true
        setOpen(true)
        try { localStorage.setItem('exit_intent_shown', '1') } catch {}
      }
    }

    try {
      if (typeof window !== 'undefined') {
        const already = localStorage.getItem('exit_intent_shown')
        if (!already) window.addEventListener('mouseleave', onMouseLeave)
      }
    } catch {}
    return () => window.removeEventListener('mouseleave', onMouseLeave)
  }, [])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <h3 className="text-lg font-semibold mb-2">Want us to text the quote to your phone?</h3>
        <p className="text-sm text-gray-600 mb-4">Finish later in 1 tap. Standard rates apply. Opt out anytime.</p>
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            const form = e.currentTarget as HTMLFormElement
            const fd = new FormData(form)
            const phone = String(fd.get('phone') || '')
            const link = typeof window !== 'undefined' ? window.location.href : ''
            try {
              const hdrs: Record<string,string> = { 'Content-Type': 'application/json' }
              const key = process.env.NEXT_PUBLIC_SMS_API_KEY || ''
              if (key) hdrs['x-api-key'] = key
              await fetch('/api/sms/send', { method: 'POST', headers: hdrs, body: JSON.stringify({ to: phone, body: `Your HMNP estimate/booking link: ${link}` }) })
              setOpen(false)
              alert('Sent! We texted your link.')
            } catch {}
          }}
          className="flex gap-2"
        >
          <input name="phone" placeholder="Mobile number" inputMode="tel" className="flex-1 rounded border px-3 py-2" required />
          <button type="submit" className="rounded bg-[#002147] text-white px-4 py-2">Text me</button>
        </form>
        <button className="mt-3 text-sm text-gray-500" onClick={() => setOpen(false)}>No thanks</button>
      </div>
    </div>
  )
}




